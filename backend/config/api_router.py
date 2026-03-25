from rest_framework.routers import DefaultRouter
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

from apps.about.views import AboutViewSet
from apps.achievements.views import AchievementViewSet
from apps.ai_lab.views import AILabViewSet
from apps.contact.views import ContactViewSet, ContactProfileViewSet, FeedbackViewSet
from apps.hire.views import HireRequestViewSet
from apps.experience.views import ExperienceViewSet
from apps.education.views import EducationViewSet
from apps.hero.views import HeroViewSet
from apps.projects.views import ProjectImageViewSet, ProjectViewSet, TagViewSet, ProjectAcquisitionViewSet
from apps.research.views import ResearchViewSet, ResearchContributionViewSet
from apps.site_settings.views import SiteSettingViewSet
from apps.skills.views import SkillViewSet
from apps.users.views import UserProfileViewSet

router = DefaultRouter()
router.register(r"hero", HeroViewSet, basename="hero")
router.register(r"about", AboutViewSet, basename="about")
router.register(r"skills", SkillViewSet, basename="skills")
router.register(r"tags", TagViewSet, basename="tags")
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"project-images", ProjectImageViewSet, basename="project-images")
router.register(r"project-acquisitions", ProjectAcquisitionViewSet, basename="project-acquisitions")
router.register(r"research", ResearchViewSet, basename="research")
router.register(r"research-contributions", ResearchContributionViewSet, basename="research-contributions")
router.register(r"education", EducationViewSet, basename="education")
router.register(r"experience", ExperienceViewSet, basename="experience")
router.register(r"achievements", AchievementViewSet, basename="achievements")
router.register(r"ai-lab", AILabViewSet, basename="ai-lab")
router.register(r"contact", ContactViewSet, basename="contact")
router.register(r"contact-profiles", ContactProfileViewSet, basename="contact-profiles")
router.register(r"feedback", FeedbackViewSet, basename="feedback")
router.register(r"hire-requests", HireRequestViewSet, basename="hire-requests")
router.register(r"site-settings", SiteSettingViewSet, basename="site-settings")
router.register(r"profiles", UserProfileViewSet, basename="profiles")

urlpatterns = router.urls

# Cache high-traffic public read endpoints for 5 minutes.
_CACHED_BASENAMES = {
	"hero",
	"about",
	"skills",
	"tags",
	"projects",
	"project-images",
	"research",
	"research-contributions",
	"education",
	"experience",
	"achievements",
	"ai-lab",
	"contact",
	"contact-profiles",
	"feedback",
	"site-settings",
}

for pattern in urlpatterns:
	if not pattern.name:
		continue
	if pattern.name.endswith("-list") or pattern.name.endswith("-detail"):
		basename = pattern.name.rsplit("-", 1)[0]
		if basename in _CACHED_BASENAMES:
			pattern.callback = cache_page(60 * 5)(
				vary_on_headers("Authorization", "Cookie")(pattern.callback)
			)
