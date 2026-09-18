import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)

ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", "info@hijbullah.me")
DEFAULT_FROM = getattr(settings, "DEFAULT_FROM_EMAIL", "info@hijbullah.me")
# Format sender name cleanly
FROM_EMAIL = f"Md. Taher Bin Omar Hijbullah <{DEFAULT_FROM}>" if "<" not in str(DEFAULT_FROM) else DEFAULT_FROM


def _send_clean_email(subject: str, text_content: str, html_content: str, to_email: str, reply_to: str = ADMIN_EMAIL):
    """
    Sends email using EmailMultiAlternatives with anti-spam compliance:
    - Sets appropriate Reply-To
    - Includes crisp plaintext fallback
    - Standard non-spam headers
    """
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=FROM_EMAIL,
            to=[to_email],
            reply_to=[reply_to] if reply_to else None,
            headers={
                "X-Mailer": "HijbullahHub Engine",
                "X-Auto-Response-Suppress": "All",
            },
        )
        if html_content:
            msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error("Failed sending email '%s' to %s: %s", subject, to_email, e)
        return False


def _wrap_html_email(badge_text: str, heading: str, lead_text: str, content_card_html: str, cta_text: str = "Explore Projects & Research →", cta_url: str = "https://hijbullah.me/projects/") -> str:
    """Wraps content in an executive, spam-filter-friendly clean responsive layout."""
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
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">AI &amp; Robotics Researcher &bull; Autonomous Systems Architect</div>
                <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">
                  <a href="mailto:info@hijbullah.me" style="color: #0284c7; text-decoration: none;">info@hijbullah.me</a> &bull; 
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
        plain = (
            f"Hello {name},\n\n"
            f"Thank you for reaching out! I have received your message regarding '{subject or 'General Inquiry'}' and will respond within 24 business hours.\n\n"
            f"Your Message:\n\"{message}\"\n\n"
            f"Best regards,\n"
            f"Md. Taher Bin Omar Hijbullah\n"
            f"AI & Robotics Researcher\n"
            f"Email: info@hijbullah.me\n"
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
