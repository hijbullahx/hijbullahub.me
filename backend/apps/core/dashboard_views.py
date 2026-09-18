import json
import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate

from apps.core.models import PageVisit
from apps.hero.models import Hero
from apps.about.models import About
from apps.skills.models import Skill
from apps.education.models import Education
from apps.experience.models import Experience
from apps.achievements.models import Achievement
from apps.contact.models import Contact, ContactProfile, Feedback
from apps.projects.models import Project, Tag, ProjectAcquisition
from apps.ai_lab.models import AILab
from apps.research.models import Research
from apps.hire.models import HireRequest
from apps.site_settings.models import SiteSetting


def dashboard_login_view(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("dashboard")

    error_message = None
    if request.method == "POST":
        u = request.POST.get("username", "").strip()
        p = request.POST.get("password", "").strip()
        user = authenticate(request, username=u, password=p)
        if user is not None and user.is_staff:
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.username}! Control studio active.")
            return redirect("dashboard")
        else:
            error_message = "Authentication rejected. Invalid credentials or insufficient admin clearance."

    return render(request, "dashboard/login.html", {"error_message": error_message})


def dashboard_logout_view(request):
    auth_logout(request)
    messages.success(request, "Logged out from executive studio successfully.")
    return redirect("dashboard_login")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_send_monthly_report_view(request):
    """Admin endpoint to dispatch live 30-day analytics report email on demand."""
    if not request.user.is_staff:
        return JsonResponse({"status": "error", "message": "Administrative clearance required."}, status=403)

    try:
        from apps.core.email_utils import send_monthly_analytics_report_email
        success = send_monthly_analytics_report_email()
        if success:
            return JsonResponse({"status": "success", "message": "Monthly telemetry report dispatched to info@hijbullah.me successfully!"})
        else:
            return JsonResponse({"status": "error", "message": "Failed to dispatch email. Please verify SMTP host and credentials."}, status=500)
    except Exception as e:
        return JsonResponse({"status": "error", "message": f"SMTP Error: {str(e)}"}, status=500)


@login_required(login_url="dashboard_login")
def dashboard_view(request):
    if not request.user.is_staff:
        messages.error(request, "Administrative clearance required.")
        return redirect("dashboard_login")

    hero = Hero.objects.filter(is_active=True).first()
    about = About.objects.first()
    skills = Skill.objects.all().order_by("display_order", "name")
    projects = Project.objects.all().order_by("display_order", "-created_at")
    education_list = Education.objects.all().order_by("display_order", "-end_date")
    experience_list = Experience.objects.all().order_by("display_order", "-highlight", "-created_at")
    ai_list = AILab.objects.all().order_by("-created_at")
    research_list = Research.objects.all().order_by("-created_at")
    contacts = Contact.objects.all().order_by("-timestamp")
    hire_requests = HireRequest.objects.all().order_by("-created_at")
    feedbacks = Feedback.objects.all().order_by("-created_at")
    site_setting = SiteSetting.objects.first()

    # ── Analytics Telemetry Aggregation (Privacy-safe, Zero browser prompts) ──
    now = timezone.now()
    today = now.date()

    total_clicks = PageVisit.objects.count()
    today_clicks = PageVisit.objects.filter(timestamp__date=today).count()
    last_week_clicks = PageVisit.objects.filter(timestamp__gte=now - datetime.timedelta(days=7)).count()
    last_year_clicks = PageVisit.objects.filter(timestamp__gte=now - datetime.timedelta(days=365)).count()

    # Peak traffic day
    peak_row = (
        PageVisit.objects
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("-count", "-date")
        .first()
    )
    peak_day_formatted = peak_row["date"].strftime("%d %b %Y") if (peak_row and peak_row.get("date")) else "No data yet"
    peak_day_count = peak_row["count"] if peak_row else 0

    # Top location (Derived strictly from IP/headers - never requests browser GPS permission)
    top_loc_row = (
        PageVisit.objects
        .exclude(country__in=["", "Unknown", None])
        .values("country")
        .annotate(count=Count("id"))
        .order_by("-count")
        .first()
    )
    if top_loc_row:
        top_location = top_loc_row["country"]
        top_location_count = top_loc_row["count"]
    else:
        first_loc = PageVisit.objects.values("country").annotate(count=Count("id")).order_by("-count").first()
        top_location = "Local / Direct" if (first_loc and first_loc["country"] in ["Unknown", "Local / Direct", ""]) else (first_loc["country"] if first_loc else "Direct / Unspecified")
        top_location_count = first_loc["count"] if first_loc else 0

    # Top locations breakdown
    top_locations_list = list(
        PageVisit.objects
        .values("country")
        .annotate(count=Count("id"))
        .order_by("-count")[:5]
    )
    for loc in top_locations_list:
        if loc["country"] in ["", "Unknown"]:
            loc["country_display"] = "Local / Direct"
        else:
            loc["country_display"] = loc["country"]
        loc["percentage"] = round((loc["count"] / total_clicks * 100), 1) if total_clicks > 0 else 0

    # Top pages visited
    top_pages = list(
        PageVisit.objects
        .values("page")
        .annotate(count=Count("id"))
        .order_by("-count")[:6]
    )

    # 14-day daily chart data
    days_14_ago = today - datetime.timedelta(days=13)
    daily_qs = (
        PageVisit.objects.filter(timestamp__date__gte=days_14_ago)
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    daily_map = {row["date"]: row["count"] for row in daily_qs}
    max_daily = max(daily_map.values(), default=1) or 1
    daily_trend = []
    for i in range(14):
        d = days_14_ago + datetime.timedelta(days=i)
        c = daily_map.get(d, 0)
        daily_trend.append({
            "date_str": d.strftime("%d %b"),
            "count": c,
            "height_percent": max(8, int((c / max_daily) * 100)) if c > 0 else 4
        })

    analytics = {
        "total_clicks": total_clicks,
        "today_clicks": today_clicks,
        "last_week_clicks": last_week_clicks,
        "last_year_clicks": last_year_clicks,
        "peak_day_formatted": peak_day_formatted,
        "peak_day_count": peak_day_count,
        "top_location": top_location,
        "top_location_count": top_location_count,
        "top_locations_list": top_locations_list,
        "top_pages": top_pages,
        "daily_trend": daily_trend,
    }

    context = {
        "hero": hero,
        "about": about,
        "skills": skills,
        "projects": projects,
        "education_list": education_list,
        "experience_list": experience_list,
        "ai_list": ai_list,
        "research_list": research_list,
        "contacts": contacts,
        "hire_requests": hire_requests,
        "feedbacks": feedbacks,
        "site_setting": site_setting,
        "projects_count": projects.count(),
        "contacts_count": contacts.count(),
        "unread_contacts_count": contacts.filter(is_read=False).count(),
        "hire_count": hire_requests.count(),
        "feedbacks_count": feedbacks.count(),
        "research_count": research_list.count(),
        "ai_count": ai_list.count(),
        "analytics": analytics,
    }
    return render(request, "dashboard/dashboard.html", context)


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_update_hero_view(request):
    try:
        hero = Hero.objects.filter(is_active=True).first()
        if not hero:
            hero = Hero.objects.create(name="Md. Taher Bin Omar Hijbullah")
        
        hero.name = request.POST.get("name", hero.name).strip()
        hero.tagline = request.POST.get("tagline", hero.tagline).strip()
        hero.short_bio = request.POST.get("short_bio", hero.short_bio).strip()

        if "profile_image" in request.FILES:
            hero.profile_image = request.FILES["profile_image"]

        hero.save()
        messages.success(request, "Hero section updated successfully.")
    except Exception as e:
        messages.error(request, f"Failed to update Hero section: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_update_about_view(request):
    try:
        about = About.objects.first()
        if not about:
            about = About()

        about.mission_statement = request.POST.get("mission_statement", "").strip()
        about.vision_2030 = request.POST.get("vision_2030", "").strip()
        about.long_bio = request.POST.get("long_bio", "").strip()
        about.quote = request.POST.get("quote", "").strip()

        if "image" in request.FILES:
            about.image = request.FILES["image"]

        about.save()
        messages.success(request, "About information updated successfully.")
    except Exception as e:
        messages.error(request, f"Failed to update About section: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_skill_view(request):
    name = request.POST.get("name", "").strip()
    category = request.POST.get("category", "General").strip()
    level_raw = request.POST.get("level", "80")

    try:
        level = int(level_raw)
    except ValueError:
        level = 80

    if name:
        Skill.objects.create(name=name, category=category, level=level)
        messages.success(request, f"Skill '{name}' added successfully.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_skill_view(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id)
    name = skill.name
    skill.delete()
    messages.success(request, f"Skill '{name}' deleted.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_project_view(request):
    try:
        title = request.POST.get("title", "").strip()
        status = request.POST.get("status", "ongoing")
        full_desc = request.POST.get("full_description", "").strip()
        short_desc = request.POST.get("short_description", "").strip()
        if not short_desc and full_desc:
            short_desc = full_desc[:250].rsplit(" ", 1)[0] if len(full_desc) > 250 else full_desc
        github_link = request.POST.get("github_link", "").strip()
        live_link = request.POST.get("live_link", "").strip()
        featured = request.POST.get("featured") == "on"

        if title:
            project = Project.objects.create(
                title=title,
                status=status,
                short_description=short_desc,
                full_description=full_desc,
                github_link=github_link,
                live_link=live_link,
                featured=featured
            )
            if "featured_image" in request.FILES:
                project.featured_image = request.FILES["featured_image"]
                project.save()

            messages.success(request, f"Project '{title}' deployed to showcase.")
    except Exception as e:
        messages.error(request, f"Failed to add project: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_project_view(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    title = project.title
    project.delete()
    messages.success(request, f"Project '{title}' removed.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_education_view(request):
    degree_name = request.POST.get("degree_name", "").strip()
    institution_name = request.POST.get("institution_name", "").strip()
    result = request.POST.get("result", "").strip()
    location = request.POST.get("location", "").strip()
    institution_type = request.POST.get("institution_type", "university").strip()
    is_current = request.POST.get("is_current") in ["on", "true", "1"]
    start_date = request.POST.get("start_date") or None
    end_date = request.POST.get("end_date") or None
    logo = request.FILES.get("institution_logo")
    certificate = request.FILES.get("certificate")

    if degree_name and institution_name:
        edu = Education(
            degree_name=degree_name,
            institution_name=institution_name,
            result=result,
            location=location,
            institution_type=institution_type,
            is_current=is_current,
            is_active=True,
        )
        if start_date:
            edu.start_date = start_date
        if end_date:
            edu.end_date = end_date
        if logo:
            edu.institution_logo = logo
        if certificate:
            edu.certificate = certificate
        edu.save()
        messages.success(request, f"Academic credential '{degree_name}' added.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_education_view(request, education_id):
    edu = get_object_or_404(Education, id=education_id)
    name = edu.degree_name
    edu.delete()
    messages.success(request, f"Academic credential '{name}' removed.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_experience_view(request):
    role = request.POST.get("role", "").strip()
    organization = request.POST.get("organization", "").strip()
    duration = request.POST.get("duration", "").strip()
    description = request.POST.get("description", "").strip()
    highlight = request.POST.get("highlight") in ["on", "true", "1"]
    logo = request.FILES.get("logo")

    if role and organization:
        exp = Experience(
            role=role,
            organization=organization,
            duration=duration,
            description=description,
            highlight=highlight,
        )
        if logo:
            exp.logo = logo
        exp.save()
        messages.success(request, f"Work experience '{role}' added.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_experience_view(request, experience_id):
    exp = get_object_or_404(Experience, id=experience_id)
    role = exp.role
    exp.delete()
    messages.success(request, f"Work experience '{role}' removed.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_ai_lab_view(request):
    title = request.POST.get("title", "").strip()
    model_name = request.POST.get("model_name", "").strip()
    link = request.POST.get("link", "").strip()

    def parse_f(val):
        try:
            return float(val) if val else None
        except ValueError:
            return None

    if title:
        AILab.objects.create(
            title=title,
            model_name=model_name,
            link=link,
            accuracy=parse_f(request.POST.get("accuracy")),
            precision=parse_f(request.POST.get("precision")),
            recall=parse_f(request.POST.get("recall")),
            f1_score=parse_f(request.POST.get("f1_score")),
            status="active"
        )
        messages.success(request, f"AI/ML experiment '{title}' registered.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_ai_lab_view(request, ai_id):
    item = get_object_or_404(AILab, id=ai_id)
    title = item.title
    item.delete()
    messages.success(request, f"AI/ML experiment '{title}' removed.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_add_research_view(request):
    try:
        title = request.POST.get("title", "").strip()
        contributors = request.POST.get("contributors", "").strip()
        status = request.POST.get("status", "published")
        abstract = request.POST.get("abstract", "").strip()
        paper_link = request.POST.get("paper_link", "").strip()

        if title:
            Research.objects.create(
                title=title,
                contributors=contributors,
                status=status,
                abstract=abstract,
                paper_link=paper_link
            )
            messages.success(request, f"Research paper '{title}' registered.")
    except Exception as e:
        messages.error(request, f"Failed to add research paper: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_research_view(request, research_id):
    item = get_object_or_404(Research, id=research_id)
    title = item.title
    item.delete()
    messages.success(request, f"Research publication '{title}' removed.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_contact_view(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id)
    contact.delete()
    messages.success(request, "Transmission deleted.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_update_settings_view(request):
    try:
        setting = SiteSetting.objects.first()
        if not setting:
            setting = SiteSetting()

        setting.site_title = request.POST.get("site_title", setting.site_title).strip()
        setting.email = request.POST.get("email", setting.email).strip()
        setting.meta_description = request.POST.get("meta_description", setting.meta_description).strip()
        setting.save()

        messages.success(request, "Global site configuration updated.")
    except Exception as e:
        messages.error(request, f"Failed to update settings: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_toggle_feedback_view(request, feedback_id):
    try:
        feedback = get_object_or_404(Feedback, id=feedback_id)
        feedback.is_visible = not feedback.is_visible
        feedback.save()
        status_text = "visible on public site" if feedback.is_visible else "hidden from public view"
        messages.success(request, f"Review from '{feedback.name}' is now {status_text}.")
    except Exception as e:
        messages.error(request, f"Failed to update review visibility: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_reply_feedback_view(request, feedback_id):
    try:
        feedback = get_object_or_404(Feedback, id=feedback_id)
        reply = request.POST.get("admin_reply", "").strip()
        display_order = request.POST.get("display_order", "0").strip()
        try:
            feedback.display_order = int(display_order)
        except ValueError:
            feedback.display_order = 0
        feedback.admin_reply = reply
        feedback.save()
        messages.success(request, f"Reply and display order saved for review by '{feedback.name}'.")
    except Exception as e:
        messages.error(request, f"Failed to save reply: {str(e)}")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_delete_feedback_view(request, feedback_id):
    try:
        feedback = get_object_or_404(Feedback, id=feedback_id)
        name = feedback.name
        feedback.delete()
        messages.success(request, f"Review from '{name}' permanently deleted.")
    except Exception as e:
        messages.error(request, f"Failed to delete review: {str(e)}")
    return redirect("dashboard")


# ── Drag-and-Drop Reorder API ──────────────────────────────────────────────────
@login_required(login_url="dashboard_login")
@require_POST
def dashboard_reorder_view(request, item_type):
    if not request.user.is_staff:
        return JsonResponse({"status": "error", "message": "Administrative clearance required."}, status=403)

    try:
        data = json.loads(request.body)
        order_ids = data.get("order", [])
        if not isinstance(order_ids, list):
            return JsonResponse({"status": "error", "message": "Invalid ordering payload."}, status=400)

        model_map = {
            "skills": Skill,
            "projects": Project,
            "education": Education,
            "experience": Experience,
        }

        model = model_map.get(item_type)
        if not model:
            return JsonResponse({"status": "error", "message": f"Unsupported reorder type '{item_type}'."}, status=400)

        for index, item_id in enumerate(order_ids):
            model.objects.filter(id=item_id).update(display_order=index)

        return JsonResponse({"status": "success", "message": f"{item_type.capitalize()} sequence updated successfully."})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# ── Item Edit Handlers ─────────────────────────────────────────────────────────
@login_required(login_url="dashboard_login")
@require_POST
def dashboard_edit_skill_view(request, skill_id):
    skill = get_object_or_404(Skill, id=skill_id)
    skill.name = request.POST.get("name", skill.name).strip()
    skill.category = request.POST.get("category", skill.category).strip()
    try:
        skill.level = int(request.POST.get("level", skill.level))
    except ValueError:
        pass

    if "icon" in request.FILES:
        skill.icon = request.FILES["icon"]

    skill.save()
    messages.success(request, f"Skill '{skill.name}' updated.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_edit_project_view(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    project.title = request.POST.get("title", project.title).strip()
    project.status = request.POST.get("status", project.status)
    project.full_description = request.POST.get("full_description", project.full_description).strip()
    short_desc = request.POST.get("short_description", "").strip()
    if short_desc:
        project.short_description = short_desc
    elif not project.short_description and project.full_description:
        project.short_description = project.full_description[:250].rsplit(" ", 1)[0] if len(project.full_description) > 250 else project.full_description
    project.github_link = request.POST.get("github_link", "").strip()
    project.live_link = request.POST.get("live_link", "").strip()
    project.demo_video_url = request.POST.get("demo_video_url", "").strip()
    project.featured = request.POST.get("featured") in ["on", "true", "1"]

    if "featured_image" in request.FILES:
        project.featured_image = request.FILES["featured_image"]

    project.save()

    tags_str = request.POST.get("tech_stack", "")
    if tags_str:
        tag_names = [t.strip() for t in tags_str.split(",") if t.strip()]
        tag_objs = []
        for name in tag_names:
            t, _ = Tag.objects.get_or_create(name=name)
            tag_objs.append(t)
        project.tech_stack.set(tag_objs)

    messages.success(request, f"Project '{project.title}' updated.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_edit_education_view(request, education_id):
    edu = get_object_or_404(Education, id=education_id)
    edu.degree_name = request.POST.get("degree_name", edu.degree_name).strip()
    edu.institution_name = request.POST.get("institution_name", edu.institution_name).strip()
    edu.institution_type = request.POST.get("institution_type", edu.institution_type).strip()
    edu.result = request.POST.get("result", "").strip()
    edu.location = request.POST.get("location", "").strip()
    edu.is_current = request.POST.get("is_current") in ["on", "true", "1"]

    start_date = request.POST.get("start_date")
    if start_date:
        edu.start_date = start_date
    end_date = request.POST.get("end_date")
    if end_date:
        edu.end_date = end_date
    elif "end_date" in request.POST and not end_date:
        edu.end_date = None

    if "institution_logo" in request.FILES:
        edu.institution_logo = request.FILES["institution_logo"]
    if "certificate" in request.FILES:
        edu.certificate = request.FILES["certificate"]

    edu.save()
    messages.success(request, f"Academic credential '{edu.degree_name}' updated.")
    return redirect("dashboard")


@login_required(login_url="dashboard_login")
@require_POST
def dashboard_edit_experience_view(request, experience_id):
    exp = get_object_or_404(Experience, id=experience_id)
    exp.role = request.POST.get("role", exp.role).strip()
    exp.organization = request.POST.get("organization", exp.organization).strip()
    exp.duration = request.POST.get("duration", exp.duration).strip()
    exp.description = request.POST.get("description", exp.description).strip()
    exp.highlight = request.POST.get("highlight") in ["on", "true", "1"]

    if "logo" in request.FILES:
        exp.logo = request.FILES["logo"]

    exp.save()
    messages.success(request, f"Work experience '{exp.role}' updated.")
    return redirect("dashboard")

