from rest_framework.routers import DefaultRouter

from apps.about.views import AboutViewSet
from apps.achievements.views import AchievementViewSet
from apps.ai_lab.views import AILabViewSet
from apps.blog.views import BlogViewSet
from apps.contact.views import ContactViewSet
from apps.experience.views import ExperienceViewSet
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
router.register(r"blog", BlogViewSet, basename="blog")
router.register(r"experience", ExperienceViewSet, basename="experience")
router.register(r"achievements", AchievementViewSet, basename="achievements")
router.register(r"ai-lab", AILabViewSet, basename="ai-lab")
router.register(r"contact", ContactViewSet, basename="contact")
router.register(r"site-settings", SiteSettingViewSet, basename="site-settings")
router.register(r"profiles", UserProfileViewSet, basename="profiles")

urlpatterns = router.urls
