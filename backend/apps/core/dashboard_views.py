from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages

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
def dashboard_view(request):
    if not request.user.is_staff:
        messages.error(request, "Administrative clearance required.")
        return redirect("dashboard_login")

    hero = Hero.objects.filter(is_active=True).first()
    about = About.objects.first()
    skills = Skill.objects.all().order_by("display_order", "name")
    projects = Project.objects.all().order_by("display_order", "-created_at")
    education_list = Education.objects.all().order_by("display_order", "-end_date")
    experience_list = Experience.objects.all().order_by("-highlight", "-created_at")
    ai_list = AILab.objects.all().order_by("-created_at")
    research_list = Research.objects.all().order_by("-created_at")
    contacts = Contact.objects.all().order_by("-timestamp")
    hire_requests = HireRequest.objects.all().order_by("-created_at")
    feedbacks = Feedback.objects.all().order_by("-created_at")
    site_setting = SiteSetting.objects.first()

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
        short_desc = request.POST.get("short_description", "").strip()
        full_desc = request.POST.get("full_description", "").strip()
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
