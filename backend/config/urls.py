from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic import RedirectView
from apps.core.views import health_check, record_visit, analytics_summary, round_favicon_view
from apps.core.page_views import (
    home_view,
    projects_view,
    ai_lab_view,
    research_view,
    contact_view,
    submit_contact_view,
    submit_feedback_view,
    submit_hire_request_view,
    submit_acquisition_view,
    submit_research_contribution_view,
)

from apps.core.dashboard_views import (
    dashboard_view,
    dashboard_login_view,
    dashboard_logout_view,
    dashboard_update_hero_view,
    dashboard_update_about_view,
    dashboard_add_skill_view,
    dashboard_delete_skill_view,
    dashboard_add_project_view,
    dashboard_delete_project_view,
    dashboard_add_education_view,
    dashboard_delete_education_view,
    dashboard_add_experience_view,
    dashboard_delete_experience_view,
    dashboard_add_ai_lab_view,
    dashboard_delete_ai_lab_view,
    dashboard_add_research_view,
    dashboard_delete_research_view,
    dashboard_delete_contact_view,
    dashboard_update_settings_view,
    dashboard_toggle_feedback_view,
    dashboard_reply_feedback_view,
    dashboard_reorder_view,
    dashboard_edit_skill_view,
    dashboard_edit_project_view,
    dashboard_edit_education_view,
    dashboard_edit_experience_view,
    dashboard_delete_feedback_view,
    dashboard_send_monthly_report_view,
)

urlpatterns = [
    # Public Executive Portfolio Pages
    path("", home_view, name="home"),
    path("projects/", projects_view, name="projects"),
    path("ai-ml/", ai_lab_view, name="ai_lab"),
    path("research/", research_view, name="research"),
    path("contact/", contact_view, name="contact"),

    # Direct Form Submissions
    path("contact/submit/", submit_contact_view, name="submit_contact"),
    path("feedback/submit/", submit_feedback_view, name="submit_feedback"),
    path("hire/submit/", submit_hire_request_view, name="submit_hire_request"),
    path("projects/acquire/", submit_acquisition_view, name="submit_acquisition"),
    path("research/contribute/", submit_research_contribution_view, name="submit_research_contribution"),

    # Custom In-Site Executive Dashboard & Studio
    path("admin/", RedirectView.as_view(url="/dashboard/", permanent=False)),
    path("dashboard/", dashboard_view, name="dashboard"),
    path("dashboard/login/", dashboard_login_view, name="dashboard_login"),
    path("dashboard/logout/", dashboard_logout_view, name="dashboard_logout"),
    path("dashboard/analytics/send-report/", dashboard_send_monthly_report_view, name="dashboard_send_monthly_report"),
    path("dashboard/reorder/<str:item_type>/", dashboard_reorder_view, name="dashboard_reorder"),
    path("dashboard/hero/update/", dashboard_update_hero_view, name="dashboard_update_hero"),
    path("dashboard/about/update/", dashboard_update_about_view, name="dashboard_update_about"),
    path("dashboard/skills/add/", dashboard_add_skill_view, name="dashboard_add_skill"),
    path("dashboard/skills/edit/<int:skill_id>/", dashboard_edit_skill_view, name="dashboard_edit_skill"),
    path("dashboard/skills/delete/<int:skill_id>/", dashboard_delete_skill_view, name="dashboard_delete_skill"),
    path("dashboard/projects/add/", dashboard_add_project_view, name="dashboard_add_project"),
    path("dashboard/projects/edit/<int:project_id>/", dashboard_edit_project_view, name="dashboard_edit_project"),
    path("dashboard/projects/delete/<int:project_id>/", dashboard_delete_project_view, name="dashboard_delete_project"),
    path("dashboard/education/add/", dashboard_add_education_view, name="dashboard_add_education"),
    path("dashboard/education/edit/<int:education_id>/", dashboard_edit_education_view, name="dashboard_edit_education"),
    path("dashboard/education/delete/<int:education_id>/", dashboard_delete_education_view, name="dashboard_delete_education"),
    path("dashboard/experience/add/", dashboard_add_experience_view, name="dashboard_add_experience"),
    path("dashboard/experience/edit/<int:experience_id>/", dashboard_edit_experience_view, name="dashboard_edit_experience"),
    path("dashboard/experience/delete/<int:experience_id>/", dashboard_delete_experience_view, name="dashboard_delete_experience"),
    path("dashboard/ai-lab/add/", dashboard_add_ai_lab_view, name="dashboard_add_ai_lab"),
    path("dashboard/ai-lab/delete/<int:ai_id>/", dashboard_delete_ai_lab_view, name="dashboard_delete_ai_lab"),
    path("dashboard/research/add/", dashboard_add_research_view, name="dashboard_add_research"),
    path("dashboard/research/delete/<int:research_id>/", dashboard_delete_research_view, name="dashboard_delete_research"),
    path("dashboard/contact/delete/<int:contact_id>/", dashboard_delete_contact_view, name="dashboard_delete_contact"),
    path("dashboard/settings/update/", dashboard_update_settings_view, name="dashboard_update_settings"),
    path("dashboard/feedback/toggle/<int:feedback_id>/", dashboard_toggle_feedback_view, name="dashboard_toggle_feedback"),
    path("dashboard/feedback/reply/<int:feedback_id>/", dashboard_reply_feedback_view, name="dashboard_reply_feedback"),
    path("dashboard/feedback/delete/<int:feedback_id>/", dashboard_delete_feedback_view, name="dashboard_delete_feedback"),

    # Raw Django Admin
    path("django-admin/", admin.site.urls),
    path("accounts/profile/", RedirectView.as_view(url="/dashboard/", permanent=False)),

    # Health & System
    path("favicon.png", round_favicon_view, name="round_favicon"),
    path("favicon.ico", round_favicon_view, name="round_favicon_ico"),
    path("health/", health_check, name="health_check"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("config.api_router")),
    path("api/analytics/visit/", record_visit, name="record_visit"),
    path("api/analytics/summary/", analytics_summary, name="analytics_summary"),
]

# Serve media files in all environments (including production)
# Note: For production, consider using Cloudinary/S3 for persistent storage
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
