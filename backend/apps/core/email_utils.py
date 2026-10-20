import logging
import email.utils
from email.utils import make_msgid, formataddr
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)

ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", "info@hijbullah.me")
DEFAULT_FROM = getattr(settings, "DEFAULT_FROM_EMAIL", "info@hijbullah.me")
# Format sender name cleanly with RFC 5322 quoted display name
FROM_EMAIL = formataddr(("Md. Taher Bin Omar Hijbullah", DEFAULT_FROM))


LAST_EMAIL_ERROR = ""


def get_last_email_error() -> str:
    global LAST_EMAIL_ERROR
    return LAST_EMAIL_ERROR


def _send_clean_email(
    subject: str,
    text_content: str,
    html_content: str,
    to_email: str,
    reply_to: str = None,
    from_email: str = None,
    is_direct_mail: bool = False,
    attachments: list = None
):
    """
    Sends email using EmailMultiAlternatives with anti-spam compliance:
    - Quotes sender display name using formataddr for strict RFC 5322 compliance
    - Generates domain-aligned Message-ID for SPF/DKIM verification in Gmail
    - Adds RFC 2822 localized Date header to avoid spam delivery penalties
    - Omits bot suppression headers on direct human correspondence
    - Includes crisp plaintext fallback
    - Dynamically pulls fresh SMTP credentials from .env to avoid stale worker memory
    - FQDN HELO identification to comply with strict SMTP servers
    """
    global LAST_EMAIL_ERROR
    LAST_EMAIL_ERROR = ""
    try:
        import os
        from dotenv import load_dotenv
        from django.core.mail import get_connection

        # Ensure environment credentials are fresh from .env (even if server was started earlier)
        base_dir = getattr(settings, "BASE_DIR", None)
        if base_dir:
            env_file = os.path.join(base_dir, ".env")
            if os.path.exists(env_file):
                load_dotenv(env_file, override=True)
        else:
            load_dotenv(override=True)

        from django.core.mail.utils import DNS_NAME
        local_host = getattr(settings, "EMAIL_LOCAL_HOSTNAME", "hijbullah.me")
        DNS_NAME._fqdn = local_host

        active_email = get_contact_email()
        sender_raw = from_email or active_email or DEFAULT_FROM
        if "<" not in sender_raw:
            sender = formataddr(("Md. Taher Bin Omar Hijbullah", sender_raw))
        else:
            sender = sender_raw

        reply_target = reply_to or active_email or ADMIN_EMAIL

        domain = sender_raw.split("@")[-1].replace(">", "").strip() if "@" in sender_raw else "hijbullah.me"
        msg_id = make_msgid(domain=domain)
        msg_date = email.utils.formatdate(localtime=True)

        headers = {
            "Message-ID": msg_id,
            "Date": msg_date,
            "X-Entity-Ref-ID": msg_id,
        }

        # Automated notifications use suppression; direct human correspondence must NOT include bot headers
        if not is_direct_mail:
            headers["X-Auto-Response-Suppress"] = "All"

        # Explicitly configure live SMTP connection with fresh credentials
        backend_name = getattr(settings, "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
        host = getattr(settings, "EMAIL_HOST", "mail.hijbullah.me")
        port = int(getattr(settings, "EMAIL_PORT", 465))
        use_ssl = getattr(settings, "EMAIL_USE_SSL", True)
        use_tls = getattr(settings, "EMAIL_USE_TLS", False)
        user = os.getenv("EMAIL_HOST_USER") or getattr(settings, "EMAIL_HOST_USER", "info@hijbullah.me")
        password = os.getenv("EMAIL_HOST_PASSWORD") or getattr(settings, "EMAIL_HOST_PASSWORD", "")

        conn = get_connection(
            backend=backend_name,
            host=host,
            port=port,
            username=user,
            password=password,
            use_ssl=use_ssl,
            use_tls=use_tls,
            timeout=20,
        )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=sender,
            to=[to_email],
            reply_to=[reply_target] if reply_target else None,
            headers=headers,
            connection=conn,
        )
        if html_content:
            msg.attach_alternative(html_content, "text/html")

        if attachments:
            for item in attachments:
                try:
                    if hasattr(item, "read"):
                        # Django UploadedFile or file-like object
                        filename = getattr(item, "name", "attachment")
                        content = item.read()
                        content_type = getattr(item, "content_type", "application/octet-stream")
                        msg.attach(filename, content, content_type)
                    elif isinstance(item, (tuple, list)) and len(item) >= 2:
                        filename = item[0]
                        content = item[1]
                        mimetype = item[2] if len(item) > 2 else "application/octet-stream"
                        msg.attach(filename, content, mimetype)
                except Exception as att_err:
                    logger.warning("Could not attach file to email: %s", att_err)

        msg.send(fail_silently=False)
        return True
    except Exception as e:
        LAST_EMAIL_ERROR = str(e)
        logger.exception("Failed sending email '%s' to %s: %s", subject, to_email, e)
        return False


def get_contact_email():
    try:
        from apps.contact.models import get_active_primary_email
        return get_active_primary_email()
    except Exception:
        return getattr(settings, "ADMIN_EMAIL", "info@hijbullah.me")


def _wrap_html_email(badge_text: str, heading: str, lead_text: str, content_card_html: str, cta_text: str = "Explore Projects & Research →", cta_url: str = "https://hijbullah.me/projects/") -> str:
    """Wraps content in an executive, spam-filter-friendly clean responsive layout."""
    contact_email = get_contact_email()
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; background: #0b0f19; border-bottom: 2px solid #06b6d4;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Hijbullah<span style="color: #06b6d4;">Hub</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-top: 3px;">
                      Md. Taher Bin Omar Hijbullah &bull; Portfolio
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; font-size: 12px; font-weight: 700; margin-bottom: 18px;">
                &#10003; {badge_text}
              </div>
              
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0; line-height: 1.4;">
                {heading}
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                {lead_text}
              </p>

              {content_card_html}

              <div style="text-align: center; margin: 24px 0;">
                <a href="{cta_url}" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);">
                  {cta_text}
                </a>
              </div>

              <!-- Sign-off & Direct Contact -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a;">Md. Taher Bin Omar Hijbullah</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Python / Django Developer &bull; AI/ML Enthusiast &bull; Research Enthusiast</div>
                <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">
                  <a href="mailto:{contact_email}" style="color: #0284c7; text-decoration: none;">{contact_email}</a> &bull; 
                  <a href="https://hijbullah.me" style="color: #0284c7; text-decoration: none;">hijbullah.me</a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
              &copy; 2026 HijbullahHub. You are receiving this confirmation because a message was submitted on <a href="https://hijbullah.me" style="color: #0284c7; text-decoration: none;">hijbullah.me</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_transmission_acknowledgment(name: str, email: str, subject: str, message: str):
    """Sends confirmation to the user and alerts the administrator."""
    if email:
        card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #0284c7; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Subject: {subject or 'General Inquiry'}</div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            &ldquo;{message}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="Message Received",
            heading=f"Hello {name}, thank you for reaching out.",
            lead_text="I have received your message and will review it carefully. I typically respond within 24 business hours.",
            content_card_html=card,
            cta_text="Explore Projects & Showcase →",
            cta_url="https://hijbullah.me/projects/"
        )
        contact_email = get_contact_email()
        plain = (
            f"Hello {name},\n\n"
            f"Thank you for reaching out! I have received your message regarding '{subject or 'General Inquiry'}' and will respond within 24 business hours.\n\n"
            f"Your Message:\n\"{message}\"\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"AI & Robotics Researcher\n"
            f"Email: {contact_email}\n"
            f"Website: https://hijbullah.me"
        )
        _send_clean_email(
            subject=f"Thank you for contacting Taher Hijbullah - Message Received",
            text_content=plain,
            html_content=html,
            to_email=email,
            reply_to=ADMIN_EMAIL,
        )

    # Admin alert
    admin_plain = (
        f"New contact form submission on HijbullahHub:\n\n"
        f"From: {name} ({email})\n"
        f"Subject: {subject}\n\n"
        f"Message:\n{message}\n"
    )
    _send_clean_email(
        subject=f"[Portfolio Contact] {subject or 'Inquiry'} from {name}",
        text_content=admin_plain,
        html_content="",
        to_email=ADMIN_EMAIL,
        reply_to=email or ADMIN_EMAIL,
    )


def send_hire_acknowledgment(name: str, email: str, work_details: str, proposed_rate: float, rate_type: str, duration: str, message: str):
    """Sends confirmation for engagement/hire proposals."""
    rate_str = f"${proposed_rate:,.2f} ({rate_type})" if proposed_rate > 0 else "Negotiable / Project-based"
    if email:
        card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #059669; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #059669; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Scope: {work_details}</div>
          <div style="font-size: 13px; color: #475569; margin-bottom: 4px;"><strong>Timeline:</strong> {duration or 'Flexible'} &bull; <strong>Budget:</strong> {rate_str}</div>
          {f'<div style="font-size: 13px; color: #334155; margin-top: 6px;">&ldquo;{message}&rdquo;</div>' if message else ''}
        </div>
        """
        html = _wrap_html_email(
            badge_text="Proposal Received",
            heading=f"Thank you {name}, your collaboration proposal has been received.",
            lead_text="Your project specifications have been logged for review. I will evaluate the technical scope and timeline, and follow up directly with next steps.",
            content_card_html=card,
            cta_text="View AI Lab Experiments →",
            cta_url="https://hijbullah.me/ai-ml/"
        )
        plain = (
            f"Hello {name},\n\n"
            f"Thank you for submitting a collaboration proposal regarding '{work_details}'.\n"
            f"Proposed Rate/Budget: {rate_str}\n"
            f"Timeline: {duration}\n\n"
            f"I will review the details and get back to you promptly.\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"https://hijbullah.me"
        )
        _send_clean_email(
            subject=f"Collaboration Proposal Received - Taher Hijbullah",
            text_content=plain,
            html_content=html,
            to_email=email,
            reply_to=ADMIN_EMAIL,
        )

    # Admin alert
    admin_plain = (
        f"New engagement proposal on HijbullahHub:\n\n"
        f"Client: {name} ({email})\n"
        f"Scope: {work_details}\n"
        f"Rate: {rate_str}\n"
        f"Duration: {duration}\n\n"
        f"Details:\n{message}\n"
    )
    _send_clean_email(
        subject=f"[New Client Proposal] {work_details} from {name}",
        text_content=admin_plain,
        html_content="",
        to_email=ADMIN_EMAIL,
        reply_to=email or ADMIN_EMAIL,
    )


def send_acquisition_acknowledgment(email: str, phone: str, message: str, project_title: str):
    """Sends confirmation for project acquisition inquiries."""
    if email:
        card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #7c3aed; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #7c3aed; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Target Project: {project_title}</div>
          {f'<div style="font-size: 13px; color: #334155; line-height: 1.5;">&ldquo;{message}&rdquo;</div>' if message else ''}
        </div>
        """
        html = _wrap_html_email(
            badge_text="Acquisition Inquiry Received",
            heading="Project acquisition inquiry confirmed.",
            lead_text=f"Thank you for your interest in licensing or acquiring <strong>{project_title}</strong>. Technical audit details and repository specifications are reviewed confidentially.",
            content_card_html=card,
            cta_text="Explore More Projects →",
            cta_url="https://hijbullah.me/projects/"
        )
        plain = (
            f"Hello,\n\n"
            f"Thank you for your inquiry regarding acquisition or licensing for '{project_title}'.\n"
            f"I will review your inquiry and follow up shortly.\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"https://hijbullah.me"
        )
        _send_clean_email(
            subject=f"Inquiry Received: {project_title} - Taher Hijbullah",
            text_content=plain,
            html_content=html,
            to_email=email,
            reply_to=ADMIN_EMAIL,
        )

    # Admin alert
    admin_plain = (
        f"New project acquisition inquiry on HijbullahHub:\n\n"
        f"Project: {project_title}\n"
        f"Email: {email}\n"
        f"Phone: {phone}\n\n"
        f"Message:\n{message}\n"
    )
    _send_clean_email(
        subject=f"[Project Acquisition] {project_title}",
        text_content=admin_plain,
        html_content="",
        to_email=ADMIN_EMAIL,
        reply_to=email or ADMIN_EMAIL,
    )


def send_research_acknowledgment(email: str, message: str, research_title: str):
    """Sends confirmation for research contribution proposals."""
    if email:
        card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #0284c7; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Paper / Topic: {research_title}</div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            &ldquo;{message}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="Research Inquiry Received",
            heading="Research contribution request acknowledged.",
            lead_text=f"Thank you for your interest in collaborating on <strong>{research_title}</strong>. Peer discussion and experimental collaboration are always welcome.",
            content_card_html=card,
            cta_text="View Research Papers →",
            cta_url="https://hijbullah.me/research/"
        )
        plain = (
            f"Hello,\n\n"
            f"Thank you for reaching out regarding '{research_title}'. I will review your proposed contribution and follow up.\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"https://hijbullah.me"
        )
        _send_clean_email(
            subject=f"Research Collaboration: {research_title} - Taher Hijbullah",
            text_content=plain,
            html_content=html,
            to_email=email,
            reply_to=ADMIN_EMAIL,
        )

    # Admin alert
    admin_plain = (
        f"New research collaboration inquiry on HijbullahHub:\n\n"
        f"Paper: {research_title}\n"
        f"Email: {email}\n\n"
        f"Message:\n{message}\n"
    )
    _send_clean_email(
        subject=f"[Research Collaboration] {research_title}",
        text_content=admin_plain,
        html_content="",
        to_email=ADMIN_EMAIL,
        reply_to=email or ADMIN_EMAIL,
    )


def send_feedback_acknowledgment(name: str, email: str, profession: str, rating: int, comment: str):
    """Sends thank-you email to reviewer if email is provided, and alerts the administrator."""
    if email:
        star_symbols = "★" * rating + "☆" * (5 - rating)
        card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="color: #f59e0b; font-size: 15px; margin-bottom: 6px;">
            {star_symbols} <span style="font-size: 12px; color: #64748b; font-weight: 600; margin-left: 8px;">({rating} / 5 Stars)</span>
          </div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            &ldquo;{comment}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="Feedback Received",
            heading=f"Thank you for your feedback, {name}!",
            lead_text="I sincerely appreciate you taking the time to share your review. Feedback helps refine my ongoing research and software projects.",
            content_card_html=card,
            cta_text="Explore Projects →",
            cta_url="https://hijbullah.me/projects/"
        )
        plain = (
            f"Hello {name},\n\n"
            f"Thank you for sharing your feedback!\n"
            f"Rating: {rating}/5 Stars\n"
            f"Comment: {comment}\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"https://hijbullah.me"
        )
        _send_clean_email(
            subject=f"Thank You for Your Feedback, {name} - Taher Hijbullah",
            text_content=plain,
            html_content=html,
            to_email=email,
            reply_to=ADMIN_EMAIL,
        )

    # Admin alert
    admin_plain = (
        f"New review submitted on HijbullahHub:\n\n"
        f"Name: {name}\n"
        f"Email: {email or 'Not provided'}\n"
        f"Profession: {profession}\n"
        f"Rating: {rating}/5 Stars\n\n"
        f"Comment:\n{comment}\n"
    )
    _send_clean_email(
        subject=f"[New Review] {rating} Stars from {name}",
        text_content=admin_plain,
        html_content="",
        to_email=ADMIN_EMAIL,
        reply_to=email or ADMIN_EMAIL,
    )


def send_monthly_analytics_report_email(to_email: str = None) -> bool:
    """
    Compiles real-time 30-day analytics data from the live database
    and dispatches an executive HTML summary report to info@hijbullah.me.
    """
    from django.utils import timezone
    import datetime
    from django.db.models import Count
    from django.db.models.functions import TruncDate
    from apps.core.models import PageVisit
    from apps.contact.models import Contact, Feedback
    from apps.hire.models import HireRequest

    target = to_email or ADMIN_EMAIL
    now = timezone.now()
    start_date = now - datetime.timedelta(days=30)
    month_name = now.strftime("%B %Y")

    # 1. Real Database Queries
    monthly_visits = PageVisit.objects.filter(timestamp__gte=start_date).count()
    total_visits = PageVisit.objects.count()

    peak_row = (
        PageVisit.objects.filter(timestamp__gte=start_date)
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("-count", "-date")
        .first()
    )
    peak_day_str = peak_row["date"].strftime("%d %b %Y") if (peak_row and peak_row.get("date")) else "No peak day"
    peak_count = peak_row["count"] if peak_row else 0

    top_locations = list(
        PageVisit.objects.filter(timestamp__gte=start_date)
        .values("country")
        .annotate(count=Count("id"))
        .order_by("-count")[:5]
    )

    top_pages = list(
        PageVisit.objects.filter(timestamp__gte=start_date)
        .values("page")
        .annotate(count=Count("id"))
        .order_by("-count")[:5]
    )

    monthly_contacts = Contact.objects.filter(timestamp__gte=start_date).count()
    monthly_hires = HireRequest.objects.filter(created_at__gte=start_date).count()
    monthly_feedbacks = Feedback.objects.filter(created_at__gte=start_date).count()

    # Determine top location name
    top_loc_name = "Direct / Local"
    if top_locations:
        first = top_locations[0]["country"]
        top_loc_name = "Local / Direct" if first in ["", "Unknown"] else first

    # Format locations HTML rows
    loc_rows = ""
    for loc in top_locations:
        c_name = "Local / Direct" if loc["country"] in ["", "Unknown"] else loc["country"]
        loc_rows += f"""
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">{c_name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #0284c7; text-align: right;">{loc['count']}</td>
        </tr>
        """
    if not loc_rows:
        loc_rows = "<tr><td colspan='2' style='padding: 10px; font-size: 12px; color: #94a3b8; text-align: center;'>No visits logged this month</td></tr>"

    # Format top pages HTML rows
    page_rows = ""
    for p in top_pages:
        page_rows += f"""
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-family: monospace; color: #0284c7;">/{p['page']}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #334155; text-align: right;">{p['count']}</td>
        </tr>
        """
    if not page_rows:
        page_rows = "<tr><td colspan='2' style='padding: 10px; font-size: 12px; color: #94a3b8; text-align: center;'>No page visit logs</td></tr>"

    # Build Content Card
    card_html = f"""
    <!-- 4 Key Stat Metric Boxes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td width="48%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Monthly Visits (30d)</div>
          <div style="font-size: 24px; font-weight: 800; color: #0284c7; margin-top: 4px;">{monthly_visits}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">All-time: {total_visits} visits</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Peak Traffic Day</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">{peak_day_str}</div>
          <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">{peak_count} clicks on peak day</div>
        </td>
      </tr>
      <tr><td colspan="3" height="12"></td></tr>
      <tr>
        <td width="48%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Top Visitor Origin</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">{top_loc_name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">IP Network Verified</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Inquiries & Leads</div>
          <div style="font-size: 24px; font-weight: 800; color: #7c3aed; margin-top: 4px;">{monthly_contacts + monthly_hires}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">{monthly_contacts} contacts • {monthly_hires} proposals</div>
        </td>
      </tr>
    </table>

    <!-- Locations & Pages Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td width="48%" style="vertical-align: top;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Top Visitor Locations</div>
          <table width="100%" style="border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            {loc_rows}
          </table>
        </td>
        <td width="4%"></td>
        <td width="48%" style="vertical-align: top;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Top Visited Pages</div>
          <table width="100%" style="border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            {page_rows}
          </table>
        </td>
      </tr>
    </table>
    """

    subject = f"[Monthly Telemetry Report] HijbullahHub Portfolio Analytics - {month_name}"
    html = _wrap_html_email(
        badge_text=f"Monthly Telemetry &bull; {month_name}",
        heading="Executive Portfolio Monthly Report",
        lead_text=f"Here is your automated monthly performance summary for <strong>hijbullah.me</strong> compiled directly from live database traffic for the past 30 days.",
        content_card_html=card_html,
        cta_text="Access Studio Control Center →",
        cta_url="https://hijbullah.me/dashboard/"
    )

    plain = (
        f"HijbullahHub Portfolio Monthly Analytics Report - {month_name}\n\n"
        f"30-Day Visits: {monthly_visits} (All-Time: {total_visits})\n"
        f"Peak Traffic Day: {peak_day_str} ({peak_count} clicks)\n"
        f"Top Origin Location: {top_loc_name}\n"
        f"New Contacts: {monthly_contacts}\n"
        f"New Hire Proposals: {monthly_hires}\n"
        f"New Client Reviews: {monthly_feedbacks}\n\n"
        f"View Full Dashboard: https://hijbullah.me/dashboard/\n"
    )

    return _send_clean_email(
        subject=subject,
        text_content=plain,
        html_content=html,
        to_email=target,
        reply_to=ADMIN_EMAIL,
    )


def send_proposal_custom_reply(
    name: str,
    to_email: str,
    subject: str,
    reply_message: str,
    work_details: str = "",
    rate_info: str = "",
    duration: str = ""
) -> bool:
    """
    Sends a direct reply from the admin/system email to a client's proposal.
    Wraps the message in an executive, branded HTML email while keeping clean plaintext fallback.
    """
    if not to_email:
        return False

    ref_card = ""
    if work_details:
        meta_bits = []
        if rate_info:
            meta_bits.append(f"<strong>Budget / Rate:</strong> {rate_info}")
        if duration:
            meta_bits.append(f"<strong>Timeline:</strong> {duration}")
        meta_html = f"<div style='font-size: 12px; color: #64748b; margin-top: 4px;'>{' &bull; '.join(meta_bits)}</div>" if meta_bits else ""

        ref_card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #06b6d4; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; color: #0891b2; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">In Reference To Proposal</div>
          <div style="font-size: 13px; font-weight: 600; color: #0f172a;">{work_details}</div>
          {meta_html}
        </div>
        """

    import html as html_lib
    paragraphs = [p.strip() for p in reply_message.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = [reply_message.strip()]
    escaped_paragraphs = [html_lib.escape(p).replace("\n", "<br>") for p in paragraphs]
    body_html = "".join([f"<p style='font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 14px 0;'>{p}</p>" for p in escaped_paragraphs])

    card_content = f"{ref_card}{body_html}"

    html = _wrap_html_email(
        badge_text="Executive Response",
        heading=subject,
        lead_text=f"Dear {name or 'Colleague'},",
        content_card_html=card_content,
        cta_text="View Interactive Portfolio →",
        cta_url="https://hijbullah.me"
    )

    plain = (
        f"Dear {name},\n\n"
        f"{reply_message}\n\n"
        f"--- In Reference To Proposal ---\n"
        f"Project / Scope: {work_details}\n"
    )
    if rate_info:
        plain += f"Budget / Rate: {rate_info}\n"
    if duration:
        plain += f"Duration: {duration}\n"
    plain += (
        f"\nBest regards,\n"
        f"Md. Taher Bin Omar Hijbullah\n"
        f"Python / Django Developer • AI/ML Enthusiast • Research Enthusiast\n"
        f"https://hijbullah.me\n"
    )

    return _send_clean_email(
        subject=subject,
        text_content=plain,
        html_content=html,
        to_email=to_email,
        reply_to=ADMIN_EMAIL,
    )


def send_contact_custom_reply(
    name: str,
    to_email: str,
    subject: str,
    reply_message: str,
    original_subject: str = "",
    original_message: str = ""
) -> bool:
    """Sends a direct response email to a general inquiry transmission."""
    if not to_email:
        return False

    import html as html_lib
    ref_card = ""
    if original_subject or original_message:
        esc_orig_sub = html_lib.escape(original_subject)
        esc_orig_msg = html_lib.escape(original_message)
        ref_card = f"""
        <div style="background: #f8fafc; border-left: 3px solid #06b6d4; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
          <div style="font-size: 11px; color: #0891b2; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">In Reference To Transmission: {esc_orig_sub}</div>
          {f'<div style="font-size: 12px; color: #64748b; margin-top: 4px; font-style: italic;">&ldquo;{esc_orig_msg}&rdquo;</div>' if esc_orig_msg else ''}
        </div>
        """

    paragraphs = [p.strip() for p in reply_message.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = [reply_message.strip()]
    escaped_paragraphs = [html_lib.escape(p).replace("\n", "<br>") for p in paragraphs]
    body_html = "".join([f"<p style='font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 14px 0;'>{p}</p>" for p in escaped_paragraphs])

    card_content = f"{ref_card}{body_html}"

    html = _wrap_html_email(
        badge_text="Executive Response",
        heading=subject,
        lead_text=f"Dear {name or 'Colleague'},",
        content_card_html=card_content,
        cta_text="View Interactive Portfolio →",
        cta_url="https://hijbullah.me"
    )

    plain = (
        f"Dear {name},\n\n"
        f"{reply_message}\n\n"
        f"--- In Reference To Your Message ---\n"
        f"Subject: {original_subject}\n"
        f"{original_message}\n\n"
        f"Best regards,\n"
        f"Md. Taher Bin Omar Hijbullah\n"
        f"Python / Django Developer • AI/ML Enthusiast • Research Enthusiast\n"
        f"https://hijbullah.me\n"
    )

    return _send_clean_email(
        subject=subject,
        text_content=plain,
        html_content=html,
        to_email=to_email,
        reply_to=ADMIN_EMAIL,
    )


def _wrap_direct_email_html(
    subject: str,
    message_body: str,
    recipient_name: str = "",
    github_url: str = "https://github.com/hijbullahx",
    linkedin_url: str = "https://www.linkedin.com/in/hijbullah/",
    phone_display: str = "",
    phone_url: str = "",
    contact_email: str = "info@hijbullah.me"
) -> str:
    """
    Renders a clean, natural business email layout matching desktop/mobile client typography.
    Omits newsletter banners, badges, and marketing CTA buttons to ensure maximum inbox deliverability.
    """
    import html as html_lib
    paragraphs = [p.strip() for p in message_body.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = [message_body.strip()]
    escaped_paragraphs = [html_lib.escape(p).replace("\n", "<br>") for p in paragraphs]

    greeting_html = f"<p style='margin: 0 0 16px 0; font-size: 15px; color: #1f2937;'>Hello {html_lib.escape(recipient_name)},</p>" if recipient_name else ""
    body_paragraphs_html = "".join([f"<p style='margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #1f2937;'>{p}</p>" for p in escaped_paragraphs])

    phone_badge_html = ""
    if phone_display:
        phone_href = phone_url or f"tel:{phone_display}"
        phone_badge_html = f"<span style='display: inline-block; margin-right: 14px;'><strong>Phone:</strong> <a href='{phone_href}' style='color: #0284c7; text-decoration: none;'>{html_lib.escape(phone_display)}</a></span>"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html_lib.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.65; font-size: 15px;">
  <div style="max-width: 600px; margin: 0 auto;">
    {greeting_html}
    {body_paragraphs_html}

    <div style="margin-top: 32px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #374151;">
      <div style="font-weight: 700; color: #111827; font-size: 15px; letter-spacing: -0.2px;">Md. Taher Bin Omar Hijbullah</div>
      <div style="color: #0284c7; font-size: 13px; font-weight: 500; margin-top: 2px;">Python / Django Developer &bull; AI/ML Enthusiast &bull; Research Enthusiast</div>
      <div style="margin-top: 10px; font-size: 12px; color: #4b5563; line-height: 1.9;">
        <span style="display: inline-block; margin-right: 14px;"><strong>Portfolio:</strong> <a href="https://hijbullah.me" style="color: #0284c7; text-decoration: none;">hijbullah.me</a></span>
        <span style="display: inline-block; margin-right: 14px;"><strong>Email:</strong> <a href="mailto:{contact_email}" style="color: #0284c7; text-decoration: none;">{contact_email}</a></span>
        <span style="display: inline-block; margin-right: 14px;"><strong>GitHub:</strong> <a href="{github_url}" style="color: #0284c7; text-decoration: none;">github.com/hijbullahx</a></span>
        <span style="display: inline-block; margin-right: 14px;"><strong>LinkedIn:</strong> <a href="{linkedin_url}" style="color: #0284c7; text-decoration: none;">linkedin.com/in/hijbullah</a></span>
        {phone_badge_html}
      </div>
    </div>
  </div>
</body>
</html>"""


def send_direct_custom_email(
    to_email: str,
    subject: str,
    message_body: str,
    recipient_name: str = "",
    attachments: list = None
) -> bool:
    """
    Direct mail dispatch engine for admin panel.
    Sends standard outbound email from the integrated email (info@hijbullah.me)
    with the administrator's verified profile channels (Portfolio, GitHub, LinkedIn, WhatsApp/Phone, Email)
    automatically appended to both HTML and plaintext versions.
    """
    if not to_email:
        return False

    contact_email = get_contact_email()

    # Query active social profiles dynamically
    github_url = "https://github.com/hijbullahx"
    linkedin_url = "https://www.linkedin.com/in/hijbullah/"
    phone_display = None
    phone_url = None

    try:
        from apps.contact.models import ContactProfile
        from django.db.models import Q
        gh_profile = ContactProfile.objects.filter(is_active=True).filter(
            Q(icon_type="github") | Q(link__icontains="github.com") | Q(title__icontains="github")
        ).first()
        if gh_profile:
            github_url = gh_profile.formatted_link or gh_profile.link

        li_profile = ContactProfile.objects.filter(is_active=True).filter(
            Q(icon_type="linkedin") | Q(link__icontains="linkedin.com") | Q(title__icontains="linkedin")
        ).first()
        if li_profile:
            linkedin_url = li_profile.formatted_link or li_profile.link

        phone_profile = ContactProfile.objects.filter(is_active=True).filter(
            Q(icon_type__in=["phone", "whatsapp"]) | Q(link__icontains="wa.me") | Q(link__startswith="tel:")
        ).first()
        if phone_profile:
            phone_display = phone_profile.display_phone_number or phone_profile.title
            phone_url = phone_profile.formatted_link or phone_profile.link
    except Exception as e:
        logger.warning("Could not query dynamic ContactProfile for email signature: %s", e)

    greeting_text = f"Hello {recipient_name}," if recipient_name else ""
    phone_plain = f"\nPhone: {phone_display}" if phone_display else ""

    html = _wrap_direct_email_html(
        subject=subject,
        message_body=message_body,
        recipient_name=recipient_name,
        github_url=github_url,
        linkedin_url=linkedin_url,
        phone_display=phone_display,
        phone_url=phone_url,
        contact_email=contact_email
    )

    greeting_block = f"{greeting_text}\n\n" if greeting_text else ""
    plain = (
        f"{greeting_block}"
        f"{message_body}\n\n"
        f"--\n"
        f"Md. Taher Bin Omar Hijbullah\n"
        f"Python / Django Developer • AI/ML Enthusiast • Research Enthusiast\n"
        f"Website: https://hijbullah.me\n"
        f"Email: {contact_email}\n"
        f"GitHub: {github_url}\n"
        f"LinkedIn: {linkedin_url}"
        f"{phone_plain}\n"
    )

    return _send_clean_email(
        subject=subject,
        text_content=plain,
        html_content=html,
        to_email=to_email,
        reply_to=contact_email,
        from_email=contact_email,
        is_direct_mail=True,
        attachments=attachments,
    )


