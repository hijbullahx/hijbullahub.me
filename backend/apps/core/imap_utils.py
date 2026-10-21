import os
import imaplib
import email
from email.header import decode_header
import email.utils
import datetime
import logging
from django.conf import settings
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


def _decode_mime_header(header_value: str) -> str:
    """Decodes RFC 2047 encoded MIME header strings (e.g. =?UTF-8?B?...?=)."""
    if not header_value:
        return ""
    try:
        decoded_fragments = decode_header(header_value)
        parts = []
        for fragment, encoding in decoded_fragments:
            if isinstance(fragment, bytes):
                enc = encoding or "utf-8"
                try:
                    parts.append(fragment.decode(enc, errors="replace"))
                except Exception:
                    parts.append(fragment.decode("utf-8", errors="replace"))
            else:
                parts.append(str(fragment))
        return "".join(parts).strip()
    except Exception as e:
        logger.debug("Failed decoding header '%s': %s", header_value, e)
        return str(header_value)


def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def _get_imap_credentials():
    base_dir = getattr(settings, "BASE_DIR", None)
    if base_dir:
        env_file = os.path.join(base_dir, ".env")
        if os.path.exists(env_file):
            load_dotenv(env_file, override=True)
    else:
        load_dotenv(override=True)

    host = os.getenv("EMAIL_HOST") or getattr(settings, "EMAIL_HOST", "mail.hijbullah.me")
    port = int(os.getenv("EMAIL_IMAP_PORT", "993"))
    user = os.getenv("EMAIL_HOST_USER") or getattr(settings, "EMAIL_HOST_USER", "info@hijbullah.me")
    password = os.getenv("EMAIL_HOST_PASSWORD") or getattr(settings, "EMAIL_HOST_PASSWORD", "")

    return host, port, user, password


def get_imap_client():
    host, port, user, password = _get_imap_credentials()
    if not password:
        raise ValueError("EMAIL_HOST_PASSWORD is not configured.")

    client = imaplib.IMAP4_SSL(host, port, timeout=12)
    client.login(user, password)
    return client


def fetch_inbox_messages(limit: int = 25, search_term: str = "") -> dict:
    """
    Fetches the latest `limit` email headers from INBOX using IMAP UID search.
    Returns:
    {
        "success": bool,
        "total": int,
        "mailbox": "info@hijbullah.me",
        "messages": [
            {
                "uid": "1759",
                "subject": "...",
                "from_name": "...",
                "from_email": "...",
                "from_raw": "...",
                "date_display": "...",
                "timestamp": int,
                "is_unread": bool,
                "has_attachments": bool
            }, ...
        ],
        "error": str or None
    }
    """
    client = None
    try:
        client = get_imap_client()
        _, mailbox_status = client.select("INBOX", readonly=True)
        total_count = int(mailbox_status[0].decode() if mailbox_status and mailbox_status[0] else 0)

        # UID search for all or filtered
        status, data = client.uid("search", None, "ALL")
        if status != "OK" or not data or not data[0]:
            return {
                "success": True,
                "total": 0,
                "mailbox": os.getenv("EMAIL_HOST_USER", "info@hijbullah.me"),
                "messages": [],
                "error": None,
            }

        all_uids = data[0].split()
        total_messages = len(all_uids)
        target_uids = all_uids[-limit:] if total_messages > limit else all_uids
        # Reverse to get newest first
        target_uids.reverse()

        messages_list = []

        for uid_bytes in target_uids:
            uid_str = uid_bytes.decode()
            try:
                res, fetch_data = client.uid("fetch", uid_bytes, "(FLAGS BODY.PEEK[HEADER.FIELDS (SUBJECT FROM TO DATE CONTENT-TYPE)])")
                if res != "OK" or not fetch_data:
                    continue

                flags_str = ""
                header_bytes = b""
                for part in fetch_data:
                    if isinstance(part, tuple):
                        header_bytes = part[1]
                    elif isinstance(part, bytes):
                        flags_str += part.decode("utf-8", errors="ignore")

                is_unread = "\\Seen" not in flags_str

                parsed_msg = email.message_from_bytes(header_bytes)
                raw_subject = parsed_msg.get("Subject", "(No Subject)")
                subject = _decode_mime_header(raw_subject) or "(No Subject)"

                raw_from = parsed_msg.get("From", "")
                decoded_from = _decode_mime_header(raw_from)
                from_name, from_email_addr = email.utils.parseaddr(decoded_from)
                if not from_name:
                    from_name = from_email_addr or decoded_from

                raw_date = parsed_msg.get("Date", "")
                parsed_date = email.utils.parsedate_to_datetime(raw_date) if raw_date else None
                if parsed_date:
                    date_display = parsed_date.strftime("%b %d, %Y %I:%M %p")
                    timestamp = int(parsed_date.timestamp())
                else:
                    date_display = raw_date
                    timestamp = 0

                content_type = parsed_msg.get_content_type()
                has_attachments = "multipart/mixed" in content_type or "multipart/related" in content_type

                # Filter by search term if provided
                if search_term:
                    term_lower = search_term.lower()
                    if term_lower not in subject.lower() and term_lower not in decoded_from.lower():
                        continue

                messages_list.append({
                    "uid": uid_str,
                    "subject": subject,
                    "from_name": from_name,
                    "from_email": from_email_addr,
                    "from_raw": decoded_from,
                    "date_display": date_display,
                    "timestamp": timestamp,
                    "is_unread": is_unread,
                    "has_attachments": has_attachments,
                })
            except Exception as e:
                logger.warning("Error parsing IMAP message UID %s: %s", uid_str, e)
                continue

        return {
            "success": True,
            "total": total_messages,
            "mailbox": os.getenv("EMAIL_HOST_USER", "info@hijbullah.me"),
            "messages": messages_list,
            "error": None,
        }

    except Exception as e:
        logger.exception("Failed to fetch INBOX messages: %s", e)
        return {
            "success": False,
            "total": 0,
            "mailbox": os.getenv("EMAIL_HOST_USER", "info@hijbullah.me"),
            "messages": [],
            "error": str(e),
        }
    finally:
        if client:
            try:
                client.close()
            except Exception:
                pass
            try:
                client.logout()
            except Exception:
                pass


def fetch_inbox_message_detail(uid: str) -> dict:
    """
    Fetches full body and attachments of a specific email by UID.
    """
    client = None
    try:
        client = get_imap_client()
        client.select("INBOX", readonly=True)

        res, data = client.uid("fetch", uid.encode(), "(RFC822)")
        if res != "OK" or not data or not data[0]:
            return {"success": False, "error": f"Message UID {uid} not found."}

        raw_email = None
        for part in data:
            if isinstance(part, tuple):
                raw_email = part[1]
                break

        if not raw_email:
            return {"success": False, "error": f"Unable to parse message content for UID {uid}."}

        msg = email.message_from_bytes(raw_email)

        subject = _decode_mime_header(msg.get("Subject", "(No Subject)"))
        from_raw = _decode_mime_header(msg.get("From", ""))
        from_name, from_email_addr = email.utils.parseaddr(from_raw)
        to_raw = _decode_mime_header(msg.get("To", ""))
        raw_date = msg.get("Date", "")
        parsed_date = email.utils.parsedate_to_datetime(raw_date) if raw_date else None
        if parsed_date:
            date_display = parsed_date.strftime("%B %d, %Y %I:%M %p")
        else:
            date_display = raw_date

        text_body = ""
        html_body = ""
        attachments = []

        if msg.is_multipart():
            part_index = 0
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                filename = part.get_filename()

                if filename:
                    filename = _decode_mime_header(filename)
                    payload = part.get_payload(decode=True) or b""
                    attachments.append({
                        "index": part_index,
                        "filename": filename,
                        "content_type": content_type,
                        "size_bytes": len(payload),
                        "size_display": _format_size(len(payload)),
                    })
                elif "attachment" in content_disposition.lower():
                    payload = part.get_payload(decode=True) or b""
                    attachments.append({
                        "index": part_index,
                        "filename": f"attachment_{part_index}",
                        "content_type": content_type,
                        "size_bytes": len(payload),
                        "size_display": _format_size(len(payload)),
                    })
                elif content_type == "text/plain" and not text_body:
                    charset = part.get_content_charset() or "utf-8"
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            text_body = payload.decode(charset, errors="replace")
                        except Exception:
                            text_body = payload.decode("utf-8", errors="replace")
                elif content_type == "text/html" and not html_body:
                    charset = part.get_content_charset() or "utf-8"
                    payload = part.get_payload(decode=True)
                    if payload:
                        try:
                            html_body = payload.decode(charset, errors="replace")
                        except Exception:
                            html_body = payload.decode("utf-8", errors="replace")
                part_index += 1
        else:
            content_type = msg.get_content_type()
            charset = msg.get_content_charset() or "utf-8"
            payload = msg.get_payload(decode=True)
            decoded = ""
            if payload:
                try:
                    decoded = payload.decode(charset, errors="replace")
                except Exception:
                    decoded = payload.decode("utf-8", errors="replace")

            if content_type == "text/html":
                html_body = decoded
            else:
                text_body = decoded

        return {
            "success": True,
            "message": {
                "uid": uid,
                "subject": subject,
                "from_name": from_name or from_email_addr or from_raw,
                "from_email": from_email_addr,
                "from_raw": from_raw,
                "to_raw": to_raw,
                "date_display": date_display,
                "text_body": text_body,
                "html_body": html_body,
                "attachments": attachments,
            }
        }
    except Exception as e:
        logger.exception("Failed to fetch message detail for UID %s: %s", uid, e)
        return {"success": False, "error": str(e)}
    finally:
        if client:
            try:
                client.close()
            except Exception:
                pass
            try:
                client.logout()
            except Exception:
                pass


def fetch_attachment_content(uid: str, attachment_index: int):
    """
    Extracts raw payload of an attachment by part index for downloading.
    Returns: (filename, payload_bytes, content_type) or (None, None, None)
    """
    client = None
    try:
        client = get_imap_client()
        client.select("INBOX", readonly=True)

        res, data = client.uid("fetch", uid.encode(), "(RFC822)")
        if res != "OK" or not data or not data[0]:
            return None, None, None

        raw_email = None
        for part in data:
            if isinstance(part, tuple):
                raw_email = part[1]
                break

        if not raw_email:
            return None, None, None

        msg = email.message_from_bytes(raw_email)
        current_index = 0
        for part in msg.walk():
            filename = part.get_filename()
            content_disposition = str(part.get("Content-Disposition", ""))
            if current_index == attachment_index and (filename or "attachment" in content_disposition.lower()):
                dec_filename = _decode_mime_header(filename) if filename else f"attachment_{attachment_index}"
                payload = part.get_payload(decode=True)
                content_type = part.get_content_type() or "application/octet-stream"
                return dec_filename, payload, content_type
            current_index += 1

        return None, None, None
    except Exception as e:
        logger.exception("Failed to fetch attachment index %s for UID %s: %s", attachment_index, uid, e)
        return None, None, None
    finally:
        if client:
            try:
                client.close()
            except Exception:
                pass
            try:
                client.logout()
            except Exception:
                pass


def delete_inbox_message(uid: str) -> dict:
    """
    Permanently deletes an email by UID from the server INBOX (cPanel Webmail).
    Marks the message with the IMAP \Deleted flag and executes EXPUNGE.
    """
    client = None
    try:
        client = get_imap_client()
        client.select("INBOX", readonly=False)

        res, data = client.uid("store", str(uid).encode(), "+FLAGS", "(\\Deleted)")
        if res != "OK":
            return {"success": False, "error": f"Failed to mark message UID {uid} for deletion on server."}

        # Permanently purge deleted messages from the mailbox
        client.expunge()

        return {"success": True, "uid": str(uid)}
    except Exception as e:
        logger.exception("Failed to delete IMAP message UID %s: %s", uid, e)
        return {"success": False, "error": str(e)}
    finally:
        if client:
            try:
                client.close()
            except Exception:
                pass
            try:
                client.logout()
            except Exception:
                pass

