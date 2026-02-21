# Architecture Notes

## Backend Design

- Modular Django apps by domain (`hero`, `projects`, `blog`, etc.)
- Shared abstract base model `TimeStampedModel` for consistency
- DRF `ModelViewSet` + `DefaultRouter` for scalable API management
- `IsAdminOrReadOnly` permissions on content endpoints
- Contact endpoint allows anonymous message creation, admin-only read/update

## Data Strategy

- No hardcoded portfolio data in frontend
- All dynamic content served from Django API
- Slugs auto-generated for `Project`, `Blog`, and `Tag`
- Image/file fields centralized under Django media settings

## Frontend Design

- React Router-driven multipage UX
- Shared API client + loading/error states
- Dark-first UI with Tailwind and glass cards
- Framer Motion reveal animations
- Recharts for AI metrics visualization
