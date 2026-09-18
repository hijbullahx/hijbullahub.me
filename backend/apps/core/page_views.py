from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.db.models import Prefetch
from django.conf import settings

from apps.core.email_utils import (
    send_transmission_acknowledgment,
    send_hire_acknowledgment,
    send_acquisition_acknowledgment,
    send_research_acknowledgment,
    send_feedback_acknowledgment,
)

from apps.hero.models import Hero
from apps.about.models import About
from apps.skills.models import Skill
from apps.education.models import Education
from apps.experience.models import Experience
from apps.achievements.models import Achievement
from apps.contact.models import Contact, ContactProfile, Feedback
from apps.projects.models import Project, Tag, ProjectAcquisition
from apps.ai_lab.models import AILab
from apps.research.models import Research, ResearchContribution
from apps.hire.models import HireRequest
from apps.site_settings.models import SiteSetting


def home_view(request):
    hero = Hero.objects.filter(is_active=True).first()
    about = About.objects.first()
    skills = Skill.objects.all().order_by("display_order", "name")
    education_list = Education.objects.filter(is_active=True).order_by("display_order", "-end_date")
    experience_list = Experience.objects.all().order_by("-highlight", "-created_at")
    achievements = Achievement.objects.all().order_by("-date")
    feedbacks = Feedback.objects.filter(is_visible=True).order_by("display_order", "-created_at")
    
    # Calculate key metrics
    projects_count = Project.objects.count()
    ai_count = AILab.objects.count()
    research_count = Research.objects.count()

    context = {
        "hero": hero,
        "about": about,
        "skills": skills,
        "education": education_list,
        "education_list": education_list,
        "experience": experience_list,
        "experience_list": experience_list,
        "achievements": achievements,
        "feedbacks": feedbacks,
        "projects_count": projects_count,
        "ai_count": ai_count,
        "research_count": research_count,
    }
    return render(request, "home.html", context)


def projects_view(request):
    projects = Project.objects.all().prefetch_related("tech_stack", "images").order_by("display_order", "-created_at")
    tags = Tag.objects.all().order_by("name")
    context = {
        "projects": projects,
        "tags": tags,
    }
    return render(request, "projects.html", context)


def ai_lab_view(request):
    experiments = AILab.objects.all().order_by("-created_at")
    context = {
        "experiments": experiments,
        "models": experiments,
    }
    return render(request, "ai_lab.html", context)


def research_view(request):
    research_list = Research.objects.all().order_by("-created_at")
    context = {
        "research_list": research_list,
    }
    return render(request, "research.html", context)


def contact_view(request):
    profiles = ContactProfile.objects.filter(is_active=True).order_by("display_order", "title")
    site_setting = SiteSetting.objects.first()
    primary_email = ""
    if site_setting and site_setting.email:
        primary_email = site_setting.email
    elif profiles.filter(icon_type="gmail").exists():
        gmail_prof = profiles.filter(icon_type="gmail").first()
        primary_email = gmail_prof.link.replace("mailto:", "")
    elif profiles.exists():
        primary_email = "hijbullah@example.com"

    context = {
        "profiles": profiles,
        "primary_email": primary_email,
    }
    return render(request, "contact.html", context)


@require_POST
def submit_contact_view(request):
    name = request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    subject = request.POST.get("subject", "").strip()
    message = request.POST.get("message", "").strip()

    if not name or not email or not message:
        messages.error(request, "Please provide your name, email, and transmission message.")
        return redirect("contact")

    Contact.objects.create(
        name=name,
        email=email,
        subject=subject or "General Inquiry",
        message=message
    )

    # Dispatch transmission acknowledgment to visitor and notification to admin
    send_transmission_acknowledgment(name=name, email=email, subject=subject, message=message)

    messages.success(request, "Transmission dispatched securely. You will receive a response within 24 hours.")
    return redirect("contact")


@require_POST
def submit_feedback_view(request):
    name = request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    profession = request.POST.get("profession", "").strip()
    rating_val = request.POST.get("rating", "5")
    comment = request.POST.get("comment", "").strip()

    try:
        rating = int(rating_val)
        if rating < 1 or rating > 5:
            rating = 5
    except ValueError:
        rating = 5

    if not name or not comment:
        messages.error(request, "Name and review comment are required.")
        return redirect("home")

    Feedback.objects.create(
        name=name,
        email=email,
        profession=profession,
        rating=rating,
        comment=comment,
        is_visible=True
    )

    # Dispatch thank-you email to reviewer (if email provided) and notification to admin
    send_feedback_acknowledgment(name=name, email=email, profession=profession, rating=rating, comment=comment)

    messages.success(request, "Thank you! Your review has been submitted successfully.")
    return redirect("home")


@require_POST
def submit_hire_request_view(request):
    name = request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    work_details = request.POST.get("work_details", "").strip()
    proposed_rate = request.POST.get("proposed_rate", "0").strip()
    rate_type = request.POST.get("rate_type", "hourly")
    duration = request.POST.get("duration", "").strip()
    message = request.POST.get("message", "").strip()

    try:
        rate_decimal = float(proposed_rate)
    except ValueError:
        rate_decimal = 0.0

    if not name or not email or not work_details:
        messages.error(request, "Please fill in all required engagement details.")
        return redirect("home")

    HireRequest.objects.create(
        name=name,
        email=email,
        work_details=work_details,
        proposed_rate=rate_decimal,
        rate_type=rate_type,
        duration=duration or "TBD",
        message=message
    )

    # Dispatch engagement confirmation to client and alert to admin
    send_hire_acknowledgment(name=name, email=email, work_details=work_details, proposed_rate=rate_decimal, rate_type=rate_type, duration=duration, message=message)

    messages.success(request, "Your proposal has been securely logged. I will review and follow up promptly.")
    return redirect("home")


@require_POST
def submit_acquisition_view(request):
    project_id = request.POST.get("project_id")
    email = request.POST.get("email", "").strip()
    phone = request.POST.get("phone", "").strip()
    message = request.POST.get("message", "").strip()

    project = get_object_or_404(Project, id=project_id)
    if not email:
        messages.error(request, "Email address is required for acquisition inquiries.")
        return redirect("projects")

    ProjectAcquisition.objects.create(
        project=project,
        email=email,
        phone=phone,
        message=message
    )

    # Dispatch acquisition confirmation to inquirer and alert to admin
    send_acquisition_acknowledgment(email=email, phone=phone, message=message, project_title=project.title)

    messages.success(request, f"Acquisition inquiry for '{project.title}' received. Our team will contact you shortly.")
    return redirect("projects")


@require_POST
def submit_research_contribution_view(request):
    research_id = request.POST.get("research_id")
    email = request.POST.get("email", "").strip()
    message = request.POST.get("message", "").strip()

    research = get_object_or_404(Research, id=research_id)
    if not email or not message:
        messages.error(request, "Email and proposed contribution details are required.")
        return redirect("research")

    ResearchContribution.objects.create(
        research=research,
        email=email,
        message=message
    )

    # Dispatch research collaboration confirmation to contributor and alert to admin
    send_research_acknowledgment(email=email, message=message, research_title=research.title)

    messages.success(request, f"Contribution request for '{research.title}' submitted successfully.")
    return redirect("research")
