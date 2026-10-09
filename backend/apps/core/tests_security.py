import ast
import io
import os
from django.test import TestCase, SimpleTestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.exceptions import ImproperlyConfigured
from PIL import Image

from apps.core.validators import (
    validate_uploaded_image,
    validate_uploaded_document,
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_DOCUMENT_EXTENSIONS,
)
from apps.hero.models import Hero
from apps.education.models import Education
from apps.contact.models import ContactProfile

User = get_user_model()


def make_test_image(format="PNG", size=(20, 20), color="blue"):
    """Helper to generate genuine, valid raster image bytes in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()


VALID_PDF_BYTES = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< >>\n%%EOF\n"


class FileUploadValidationTests(SimpleTestCase):
    def test_valid_jpeg_accepted(self):
        jpeg_bytes = make_test_image(format="JPEG")
        file = SimpleUploadedFile("avatar.jpg", jpeg_bytes, content_type="image/jpeg")
        is_valid, err = validate_uploaded_image(file, field_name="Profile image")
        self.assertTrue(is_valid)
        self.assertEqual(err, "")

    def test_valid_png_accepted(self):
        png_bytes = make_test_image(format="PNG")
        file = SimpleUploadedFile("graphic.png", png_bytes, content_type="image/png")
        is_valid, err = validate_uploaded_image(file, field_name="Project image")
        self.assertTrue(is_valid)
        self.assertEqual(err, "")

    def test_valid_webp_accepted(self):
        webp_bytes = make_test_image(format="WEBP")
        file = SimpleUploadedFile("banner.webp", webp_bytes, content_type="image/webp")
        is_valid, err = validate_uploaded_image(file, field_name="Banner")
        self.assertTrue(is_valid)
        self.assertEqual(err, "")

    def test_disallowed_image_extension_rejected(self):
        file = SimpleUploadedFile("malicious.exe", b"malicious binary payload", content_type="application/octet-stream")
        is_valid, err = validate_uploaded_image(file, field_name="Profile image")
        self.assertFalse(is_valid)
        self.assertIn("Invalid file format", err)

    def test_svg_extension_rejected(self):
        svg_content = b'<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'
        file = SimpleUploadedFile("icon.svg", svg_content, content_type="image/svg+xml")
        is_valid, err = validate_uploaded_image(file, field_name="Icon")
        self.assertFalse(is_valid)
        self.assertIn("Invalid file format", err)

    def test_svg_with_script_disguised_as_png_rejected(self):
        xss_svg = b'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>fetch("/x")</script></svg>'
        file = SimpleUploadedFile("evil.png", xss_svg, content_type="image/png")
        is_valid, err = validate_uploaded_image(file, field_name="Profile image")
        self.assertFalse(is_valid)
        self.assertIn("not a valid or readable image", err)

    def test_html_disguised_as_png_rejected(self):
        html_payload = b'<!DOCTYPE html><html><body><script>alert("xss")</script></body></html>'
        file = SimpleUploadedFile("photo.png", html_payload, content_type="image/png")
        is_valid, err = validate_uploaded_image(file, field_name="Photo")
        self.assertFalse(is_valid)
        self.assertIn("not a valid or readable image", err)

    def test_executable_disguised_as_jpeg_rejected(self):
        pe_payload = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00This program cannot be run in DOS mode."
        file = SimpleUploadedFile("photo.jpg", pe_payload, content_type="image/jpeg")
        is_valid, err = validate_uploaded_image(file, field_name="Photo")
        self.assertFalse(is_valid)
        self.assertIn("not a valid or readable image", err)

    def test_spoofed_mime_type_rejected(self):
        png_bytes = make_test_image(format="PNG")
        file = SimpleUploadedFile("graphic.png", png_bytes, content_type="text/plain")
        is_valid, err = validate_uploaded_image(file, field_name="Graphic")
        self.assertFalse(is_valid)
        self.assertIn("Invalid content type", err)

    def test_truncated_image_rejected(self):
        truncated_png = make_test_image(format="PNG")[:25]
        file = SimpleUploadedFile("corrupted.png", truncated_png, content_type="image/png")
        is_valid, err = validate_uploaded_image(file, field_name="Image")
        self.assertFalse(is_valid)
        self.assertIn("not a valid or readable image", err)

    def test_image_oversized_rejected(self):
        large_bytes = make_test_image(format="PNG", size=(100, 100))
        file = SimpleUploadedFile("big.png", large_bytes, content_type="image/png")
        is_valid, err = validate_uploaded_image(file, field_name="Banner", max_size=len(large_bytes) - 10)
        self.assertFalse(is_valid)
        self.assertIn("exceeds maximum allowed limit", err)

    def test_valid_pdf_document_accepted(self):
        file = SimpleUploadedFile("cert.pdf", VALID_PDF_BYTES, content_type="application/pdf")
        is_valid, err = validate_uploaded_document(file, field_name="Certificate")
        self.assertTrue(is_valid)
        self.assertEqual(err, "")

    def test_pdf_disguised_text_rejected(self):
        fake_pdf = b"This is just a text file renamed to .pdf to trick the validator."
        file = SimpleUploadedFile("cert.pdf", fake_pdf, content_type="application/pdf")
        is_valid, err = validate_uploaded_document(file, field_name="Certificate")
        self.assertFalse(is_valid)
        self.assertIn("does not contain a valid PDF document header", err)

    def test_pdf_disguised_html_rejected(self):
        fake_pdf = b"<html><body><h1>Not a PDF</h1></body></html>"
        file = SimpleUploadedFile("doc.pdf", fake_pdf, content_type="application/pdf")
        is_valid, err = validate_uploaded_document(file, field_name="Document")
        self.assertFalse(is_valid)
        self.assertIn("does not contain a valid PDF document header", err)

    def test_raster_certificate_validated_as_image(self):
        # Valid PNG certificate
        png_bytes = make_test_image(format="PNG")
        valid_cert = SimpleUploadedFile("cert.png", png_bytes, content_type="image/png")
        is_valid, err = validate_uploaded_document(valid_cert, field_name="Certificate")
        self.assertTrue(is_valid)

        # Fake PNG certificate
        fake_cert = SimpleUploadedFile("cert.png", b"not a png image", content_type="image/png")
        is_valid, err = validate_uploaded_document(fake_cert, field_name="Certificate")
        self.assertFalse(is_valid)
        self.assertIn("not a valid or readable image", err)

    def test_document_oversized_rejected(self):
        file = SimpleUploadedFile("huge.pdf", VALID_PDF_BYTES, content_type="application/pdf")
        is_valid, err = validate_uploaded_document(file, field_name="Certificate", max_size=10)
        self.assertFalse(is_valid)
        self.assertIn("exceeds maximum allowed limit", err)


class ProductionSettingsConfigurationTests(SimpleTestCase):
    def _evaluate_production_settings(self, debug=False, secret_key=None, allowed_hosts="hijbullah.me"):
        """Simulates settings.py production evaluation logic."""
        _dev_default_secret = "unsafe-dev-key-change-me"

        if not secret_key:
            if debug:
                secret_key = _dev_default_secret
            else:
                raise ImproperlyConfigured(
                    "SECRET_KEY must be set to a secure, private string in production (DEBUG=False)."
                )
        elif not debug and (secret_key == _dev_default_secret or secret_key.startswith("django-insecure-")):
            raise ImproperlyConfigured(
                "Insecure default or development SECRET_KEY detected in production (DEBUG=False)."
            )

        _raw_hosts = (allowed_hosts or "").strip()
        if not debug:
            if not _raw_hosts or _raw_hosts == "*":
                raise ImproperlyConfigured(
                    "ALLOWED_HOSTS must be explicitly configured in production (DEBUG=False)."
                )
            hosts = [h.strip() for h in _raw_hosts.split(",") if h.strip() and h.strip() != "*"]
        else:
            hosts = ["127.0.0.1", "localhost"]
        return secret_key, hosts

    def test_missing_secret_key_in_production_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            self._evaluate_production_settings(debug=False, secret_key="", allowed_hosts="hijbullah.me")
        self.assertIn("SECRET_KEY must be set", str(ctx.exception))

    def test_dev_default_secret_key_in_production_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            self._evaluate_production_settings(debug=False, secret_key="unsafe-dev-key-change-me", allowed_hosts="hijbullah.me")
        self.assertIn("Insecure default", str(ctx.exception))

    def test_django_insecure_prefix_in_production_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            self._evaluate_production_settings(debug=False, secret_key="django-insecure-some-random-auto-generated-key", allowed_hosts="hijbullah.me")
        self.assertIn("Insecure default or development SECRET_KEY", str(ctx.exception))

    def test_wildcard_allowed_hosts_in_production_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            self._evaluate_production_settings(debug=False, secret_key="a-valid-production-secret-key-1234567890", allowed_hosts="*")
        self.assertIn("ALLOWED_HOSTS must be explicitly configured", str(ctx.exception))

    def test_empty_allowed_hosts_in_production_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            self._evaluate_production_settings(debug=False, secret_key="a-valid-production-secret-key-1234567890", allowed_hosts="")
        self.assertIn("ALLOWED_HOSTS must be explicitly configured", str(ctx.exception))

    def test_valid_production_config_succeeds(self):
        key, hosts = self._evaluate_production_settings(
            debug=False,
            secret_key="a-valid-strong-production-secret-key-that-is-long",
            allowed_hosts="hijbullah.me,www.hijbullah.me"
        )
        self.assertEqual(key, "a-valid-strong-production-secret-key-that-is-long")
        self.assertEqual(hosts, ["hijbullah.me", "www.hijbullah.me"])


class ClickjackingProtectionTests(TestCase):
    def test_x_frame_options_sameorigin_header_present(self):
        client = Client()
        response = client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("X-Frame-Options", response.headers)
        self.assertEqual(response.headers["X-Frame-Options"], "SAMEORIGIN")


class DashboardStaffAuthorizationTests(TestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username="staff_admin",
            password="testpassword123",
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username="regular_visitor",
            password="testpassword123",
            is_staff=False
        )

    def test_anonymous_user_blocked_from_mutation_endpoint(self):
        client = Client()
        url = reverse("dashboard_update_hero")
        response = client.post(url, {"name": "Hacked Name"})
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("dashboard_login"), response.url)

    def test_regular_user_blocked_from_mutation_endpoint(self):
        client = Client()
        client.login(username="regular_visitor", password="testpassword123")
        url = reverse("dashboard_update_hero")
        response = client.post(url, {"name": "Hacked Name"})
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("dashboard_login"), response.url)

    def test_regular_user_blocked_from_dashboard_view(self):
        client = Client()
        client.login(username="regular_visitor", password="testpassword123")
        response = client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("dashboard_login"), response.url)

    def test_staff_user_allowed_to_access_dashboard(self):
        client = Client()
        client.login(username="staff_admin", password="testpassword123")
        response = client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 200)


class NoDebugPrintStatementsTest(SimpleTestCase):
    def test_contact_views_has_no_print_calls(self):
        contact_views_path = os.path.join(
            os.path.dirname(__file__), "..", "contact", "views.py"
        )
        with open(contact_views_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())

        print_calls = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == "print":
                    print_calls.append(node.lineno)

        self.assertEqual(print_calls, [], f"Found debug print() on lines: {print_calls}")


class DashboardUploadIntegrationTests(TestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username="staff_editor",
            password="testpassword123",
            is_staff=True
        )
        self.hero = Hero.objects.create(name="Original Hero", is_active=True)

    def test_valid_image_upload_in_hero_update(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")
        url = reverse("dashboard_update_hero")
        png_bytes = make_test_image(format="PNG")
        valid_file = SimpleUploadedFile("avatar.png", png_bytes, content_type="image/png")
        response = client.post(url, {"name": "Updated Hero", "profile_image": valid_file}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.hero.refresh_from_db()
        self.assertEqual(self.hero.name, "Updated Hero")
        self.assertTrue(bool(self.hero.profile_image))

    def test_upload_without_file_preserves_existing_assets(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")
        # Give hero an image first
        png_bytes = make_test_image(format="PNG")
        self.hero.profile_image = SimpleUploadedFile("initial.png", png_bytes, content_type="image/png")
        self.hero.save()
        initial_image_name = self.hero.profile_image.name

        # Post update without profile_image
        url = reverse("dashboard_update_hero")
        response = client.post(url, {"name": "Text Only Update"}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.hero.refresh_from_db()
        self.assertEqual(self.hero.name, "Text Only Update")
        self.assertEqual(self.hero.profile_image.name, initial_image_name)

    def test_invalid_file_rejected_in_hero_update(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")
        url = reverse("dashboard_update_hero")
        bad_file = SimpleUploadedFile("danger.exe", b"binary executable", content_type="application/octet-stream")
        response = client.post(url, {"name": "Hero Admin", "profile_image": bad_file}, follow=True)
        self.assertEqual(response.status_code, 200)
        messages_list = list(response.context["messages"])
        self.assertTrue(any("Invalid file format" in str(m) for m in messages_list))

    def test_disguised_file_rejected_in_hero_update(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")
        url = reverse("dashboard_update_hero")
        fake_png = SimpleUploadedFile("fake.png", b"<!DOCTYPE html><script>bad()</script>", content_type="image/png")
        response = client.post(url, {"name": "Hero Admin", "profile_image": fake_png}, follow=True)
        self.assertEqual(response.status_code, 200)
        messages_list = list(response.context["messages"])
        self.assertTrue(any("not a valid or readable image" in str(m) for m in messages_list))

    def test_invalid_certificate_rejected_in_add_education(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")
        url = reverse("dashboard_add_education")
        bad_cert = SimpleUploadedFile("exploit.sh", b"#!/bin/bash", content_type="application/x-sh")
        response = client.post(url, {
            "degree_name": "B.Sc. CS",
            "institution_name": "Tech University",
            "certificate": bad_cert
        }, follow=True)
        self.assertEqual(response.status_code, 200)
        messages_list = list(response.context["messages"])
        self.assertTrue(any("Invalid file format" in str(m) for m in messages_list))
        self.assertFalse(Education.objects.filter(degree_name="B.Sc. CS").exists())

    def test_contact_profile_mutation_blocked_for_anonymous_and_regular_user(self):
        client = Client()
        add_url = reverse("dashboard_add_contact_profile")
        # Anonymous post should redirect to login
        res_anon = client.post(add_url, {"title": "X Profile", "link": "https://x.com/profile"})
        self.assertEqual(res_anon.status_code, 302)
        self.assertIn(reverse("dashboard_login"), res_anon.url)

        # Regular user should also be blocked and redirected
        reg_user = User.objects.create_user(username="anon_viewer", password="password123", is_staff=False)
        client.login(username="anon_viewer", password="password123")
        res_user = client.post(add_url, {"title": "X Profile", "link": "https://x.com/profile"})
        self.assertEqual(res_user.status_code, 302)
        self.assertIn(reverse("dashboard_login"), res_user.url)
        self.assertFalse(ContactProfile.objects.filter(title="X Profile").exists())

    def test_contact_profile_add_edit_delete_flow_staff(self):
        client = Client()
        client.login(username="staff_editor", password="testpassword123")

        # 1. Add
        add_url = reverse("dashboard_add_contact_profile")
        res_add = client.post(add_url, {
            "title": "Mastodon",
            "icon_type": "custom",
            "link": "https://mastodon.social/@test",
            "display_order": 5,
            "is_active": "on",
        }, follow=True)
        self.assertEqual(res_add.status_code, 200)
        profile = ContactProfile.objects.filter(title="Mastodon").first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.link, "https://mastodon.social/@test")
        self.assertTrue(profile.is_active)

        # 2. Edit
        edit_url = reverse("dashboard_edit_contact_profile", kwargs={"profile_id": profile.id})
        res_edit = client.post(edit_url, {
            "title": "Mastodon Official",
            "icon_type": "website",
            "link": "https://mastodon.social/@official",
            "display_order": 2,
            "is_active": "on",
        }, follow=True)
        self.assertEqual(res_edit.status_code, 200)
        profile.refresh_from_db()
        self.assertEqual(profile.title, "Mastodon Official")
        self.assertEqual(profile.icon_type, "website")
        self.assertEqual(profile.link, "https://mastodon.social/@official")

        # 3. Delete
        del_url = reverse("dashboard_delete_contact_profile", kwargs={"profile_id": profile.id})
        res_del = client.post(del_url, follow=True)
        self.assertEqual(res_del.status_code, 200)
        self.assertFalse(ContactProfile.objects.filter(id=profile.id).exists())
