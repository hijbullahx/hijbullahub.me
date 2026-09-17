from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", "info@hijbullah.me")
FROM_EMAIL = getattr(settings, "DEFAULT_FROM_EMAIL", "HijbullahHub <info@helplinehellonaogaon.com>")


def _wrap_html_email(badge_text: str, heading: str, lead_text: str, content_card_html: str, cta_text: str = "Explore Projects & Research →", cta_url: str = "https://hijbullah.me/projects/") -> str:
    """Wraps content in an executive cyber-aesthetic email layout."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #111827; border-radius: 16px; border: 1px solid rgba(6, 182, 212, 0.25); box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                Hijbullah<span style="color: #06b6d4;">Hub</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #06b6d4; margin-top: 4px;">
                Autonomous Intelligence &bull; Research &bull; Robotics
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 12px; font-weight: 700; margin-bottom: 20px;">
                &#10003; {badge_text}
              </div>
              
              <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; line-height: 1.4;">
                {heading}
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                {lead_text}
              </p>

              {content_card_html}

              <div style="text-align: center; margin: 28px 0;">
                <a href="{cta_url}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);">
                  {cta_text}
                </a>
              </div>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 700; color: #ffffff;">Md. Taher Bin Omar Hijbullah</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">AI &amp; Robotics Researcher &bull; Autonomous Systems Architect</div>
                <div style="font-size: 12px; color: #06b6d4; margin-top: 4px;">
                  <a href="mailto:info@hijbullah.me" style="color: #06b6d4; text-decoration: none;">info@hijbullah.me</a> &bull; 
                  <a href="https://hijbullah.me" style="color: #06b6d4; text-decoration: none;">hijbullah.me</a>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: rgba(0,0,0,0.3); text-align: center; font-size: 11px; color: #475569;">
              &copy; 2026 HijbullahHub &bull; Automated transmission dispatch &bull; Direct NDA on request
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
    # 1. User confirmation
    if email:
        card = f"""
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #06b6d4; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #06b6d4; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Subject: {subject or 'General Inquiry'}</div>
          <div style="font-size: 13px; font-style: italic; color: #cbd5e1; line-height: 1.5;">
            &ldquo;{message}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="Transmission Received &bull; SLA: 24 Hours",
            heading=f"Hello {name}, your transmission has been logged.",
            lead_text="Thank you for reaching out through my portfolio terminal. Your transmission has been safely received. All verified inquiries receive an executive response within 24 business hours.",
            content_card_html=card,
            cta_text="Explore Projects & Showcase →",
            cta_url="https://hijbullah.me/projects/"
        )
        try:
            send_mail(
                subject=f"Transmission Logged: {subject or 'Inquiry'} // HijbullahHub",
                message=f"Hi {name},\n\nThank you for reaching out! Your transmission has been logged and I will respond within 24 business hours.\n\nSubject: {subject}\nMessage:\n{message}\n\nBest regards,\nMd. Taher Bin Omar Hijbullah\ninfo@hijbullah.me\nhijbullah.me",
                from_email=FROM_EMAIL,
                recipient_list=[email],
                html_message=html,
                fail_silently=True,
            )
        except Exception as e:
            logger.error("Failed to send transmission confirmation: %s", e)

    # 2. Admin alert to info@hijbullah.me
    try:
        send_mail(
            subject=f"[New Transmission] {subject or 'General Inquiry'} from {name}",
            message=f"New transmission received on HijbullahHub:\n\nSender: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}\n",
            from_email=FROM_EMAIL,
            recipient_list=[ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send transmission admin alert: %s", e)


def send_hire_acknowledgment(name: str, email: str, work_details: str, proposed_rate: float, rate_type: str, duration: str, message: str):
    """Sends confirmation for engagement/hire proposals."""
    if email:
        rate_str = f"${proposed_rate:,.2f} ({rate_type})" if proposed_rate > 0 else "Negotiable / Project-based"
        card = f"""
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #10b981; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #10b981; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Scope: {work_details}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;"><strong>Timeline:</strong> {duration or 'Flexible'} &bull; <strong>Budget/Rate:</strong> {rate_str}</div>
          {f'<div style="font-size: 13px; font-style: italic; color: #cbd5e1; margin-top: 8px;">&ldquo;{message}&rdquo;</div>' if message else ''}
        </div>
        """
        html = _wrap_html_email(
            badge_text="Engagement Proposal Logged &bull; Priority Review",
            heading=f"Thank you {name}, your proposal has been received.",
            lead_text="Your project specifications and collaboration proposal have been securely queued for review. I will evaluate technical feasibility and availability, then reply directly with milestones and next steps.",
            content_card_html=card,
            cta_text="View Autonomous AI Lab Experiments →",
            cta_url="https://hijbullah.me/ai-ml/"
        )
        try:
            send_mail(
                subject=f"Engagement Proposal Received // HijbullahHub",
                message=f"Hi {name},\n\nThank you for your engagement proposal regarding '{work_details}'. I will review your requirements and follow up promptly.\n\nBest regards,\nMd. Taher Bin Omar Hijbullah\ninfo@hijbullah.me\nhijbullah.me",
                from_email=FROM_EMAIL,
                recipient_list=[email],
                html_message=html,
                fail_silently=True,
            )
        except Exception as e:
            logger.error("Failed to send hire confirmation: %s", e)

    # Admin alert
    try:
        send_mail(
            subject=f"[New Client Engagement] {work_details} from {name}",
            message=f"New engagement proposal received on HijbullahHub:\n\nClient: {name}\nEmail: {email}\nScope: {work_details}\nRate: ${proposed_rate} ({rate_type})\nDuration: {duration}\n\nDetails:\n{message}\n",
            from_email=FROM_EMAIL,
            recipient_list=[ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send hire admin alert: %s", e)


def send_acquisition_acknowledgment(email: str, phone: str, message: str, project_title: str):
    """Sends confirmation for project acquisition inquiries."""
    if email:
        card = f"""
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #8b5cf6; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #a78bfa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Target Asset: {project_title}</div>
          {f'<div style="font-size: 13px; font-style: italic; color: #cbd5e1; line-height: 1.5;">&ldquo;{message}&rdquo;</div>' if message else ''}
        </div>
        """
        html = _wrap_html_email(
            badge_text="Acquisition Inquiry Logged &bull; Confidential",
            heading="Project acquisition inquiry confirmed.",
            lead_text=f"Thank you for your interest in acquiring or licensing rights to <strong>{project_title}</strong>. IP terms, code repository audit, and documentation packets are reviewed on a confidential basis under standard mutual NDA.",
            content_card_html=card,
            cta_text="Explore More Engineered Projects →",
            cta_url="https://hijbullah.me/projects/"
        )
        try:
            send_mail(
                subject=f"Acquisition Inquiry Received: {project_title} // HijbullahHub",
                message=f"Thank you for your inquiry regarding acquisition/licensing for '{project_title}'. We will review your request and follow up shortly.\n\nBest regards,\nMd. Taher Bin Omar Hijbullah\ninfo@hijbullah.me\nhijbullah.me",
                from_email=FROM_EMAIL,
                recipient_list=[email],
                html_message=html,
                fail_silently=True,
            )
        except Exception as e:
            logger.error("Failed to send acquisition confirmation: %s", e)

    # Admin alert
    try:
        send_mail(
            subject=f"[Project Acquisition Inquiry] {project_title}",
            message=f"New acquisition inquiry on HijbullahHub:\n\nProject: {project_title}\nInquirer Email: {email}\nPhone: {phone}\n\nMessage:\n{message}\n",
            from_email=FROM_EMAIL,
            recipient_list=[ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send acquisition admin alert: %s", e)


def send_research_acknowledgment(email: str, message: str, research_title: str):
    """Sends confirmation for research contribution proposals."""
    if email:
        card = f"""
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #06b6d4; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #06b6d4; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Paper: {research_title}</div>
          <div style="font-size: 13px; font-style: italic; color: #cbd5e1; line-height: 1.5;">
            &ldquo;{message}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="Research Collaboration Logged &bull; Open Science",
            heading="Research contribution request acknowledged.",
            lead_text=f"Thank you for expressing interest in collaborating on <strong>{research_title}</strong>. Peer co-authorship and multi-disciplinary validation are strongly welcomed.",
            content_card_html=card,
            cta_text="View Research Papers & Preprints →",
            cta_url="https://hijbullah.me/research/"
        )
        try:
            send_mail(
                subject=f"Research Contribution Acknowledged: {research_title} // HijbullahHub",
                message=f"Thank you for expressing interest in contributing to '{research_title}'. I will review your proposed contribution and follow up shortly.\n\nBest regards,\nMd. Taher Bin Omar Hijbullah\ninfo@hijbullah.me\nhijbullah.me",
                from_email=FROM_EMAIL,
                recipient_list=[email],
                html_message=html,
                fail_silently=True,
            )
        except Exception as e:
            logger.error("Failed to send research confirmation: %s", e)

    # Admin alert
    try:
        send_mail(
            subject=f"[Research Contribution Request] {research_title}",
            message=f"New research contribution proposal on HijbullahHub:\n\nPaper: {research_title}\nContributor Email: {email}\n\nProposed Contribution:\n{message}\n",
            from_email=FROM_EMAIL,
            recipient_list=[ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send research admin alert: %s", e)


def send_feedback_acknowledgment(name: str, email: str, profession: str, rating: int, comment: str):
    """Sends thank-you email to reviewer if email is provided, and alerts the administrator."""
    if email:
        star_symbols = "★" * rating + "☆" * (5 - rating)
        card = f"""
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #fbbf24; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
          <div style="color: #fbbf24; font-size: 16px; margin-bottom: 8px; letter-spacing: 2px;">
            {star_symbols} <span style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-left: 8px;">({rating} / 5 Stars)</span>
          </div>
          <div style="font-size: 13px; font-style: italic; color: #cbd5e1; line-height: 1.5;">
            &ldquo;{comment}&rdquo;
          </div>
        </div>
        """
        html = _wrap_html_email(
            badge_text="&#10003; Review Verified &bull; Registered",
            heading=f"Thank you for your feedback, {name}!",
            lead_text="I truly appreciate you taking the time to share your perspective. Collaborative critique and industry feedback are foundational to advancing my research in embodied autonomous robotics and scalable machine learning architectures.",
            content_card_html=card,
            cta_text="Explore Innovation Showcase &rarr;",
            cta_url="https://hijbullah.me/projects/"
        )
        try:
            send_mail(
                subject="Thank You for Your Feedback on HijbullahHub // Verified Review",
                message=f"Hi {name},\n\nThank you for sharing your feedback!\n\nYour Rating: {rating}/5 Stars\nComment: {comment}\n\nBest regards,\nMd. Taher Bin Omar Hijbullah\ninfo@hijbullah.me\nhijbullah.me",
                from_email=FROM_EMAIL,
                recipient_list=[email],
                html_message=html,
                fail_silently=True,
            )
        except Exception as e:
            logger.error("Failed to send feedback thank-you email: %s", e)

    # Admin alert
    try:
        send_mail(
            subject=f"[New Review Received] {rating}★ from {name}",
            message=f"New feedback received on HijbullahHub:\n\nName: {name}\nEmail: {email or 'Not provided'}\nProfession: {profession}\nRating: {rating}/5 Stars\nComment:\n{comment}\n",
            from_email=FROM_EMAIL,
            recipient_list=[ADMIN_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        logger.error("Failed to send feedback admin alert: %s", e)
