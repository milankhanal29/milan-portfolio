"""Seed script to populate the database with sample data."""

import asyncio
import uuid
from datetime import date, datetime, timezone

from app.database import async_session, init_db
from app.models.profile import Profile
from app.models.experience import Experience
from app.models.project import Project
from app.models.blog import BlogPost
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.models.site_settings import SiteSettings
from app.models.birthday import BirthdayEvent, MenuItem
from app.services.auth_service import create_admin_user
from app.config import settings


async def seed():
    """Seed the database with sample data."""
    await init_db()

    async with async_session() as db:
        # Admin user
        await create_admin_user(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
        print("✅ Admin user created")

        # Profile
        profile = Profile(
            id=uuid.uuid4(),
            name="Milan Khanal",
            bio="Passionate full-stack developer with expertise in building scalable web applications. "
                "I love turning complex problems into simple, beautiful, and intuitive solutions. "
                "With experience in Python, TypeScript, React, and cloud technologies, I create "
                "digital experiences that make a difference.",
            avatar_url="/uploads/portfolio/avatar.jpg",
            tagline="Full-Stack Developer • Building the Future, One Line at a Time",
            social_links={
                "github": "https://github.com/milankhanal",
                "linkedin": "https://linkedin.com/in/milankhanal",
                "twitter": "https://twitter.com/milankhanal",
                "email": "hello@khanalmilan.com.np",
            },
            resume_url="/uploads/portfolio/resume.pdf",
            location="Kathmandu, Nepal 🇳🇵",
            email="hello@khanalmilan.com.np",
            dob=date(2000, 5, 15),
        )
        db.add(profile)

        # Experiences
        experiences = [
            Experience(
                id=uuid.uuid4(),
                company="Tech Innovations Pvt. Ltd.",
                role="Senior Full-Stack Developer",
                start_date=date(2023, 6, 1),
                description="Leading development of enterprise web applications using Python/FastAPI and React/Next.js. "
                           "Architecting microservices, implementing CI/CD pipelines, and mentoring junior developers.",
                tech_stack=["Python", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker", "AWS"],
                is_current=True,
                order=1,
            ),
            Experience(
                id=uuid.uuid4(),
                company="Digital Nepal Solutions",
                role="Full-Stack Developer",
                start_date=date(2022, 1, 1),
                end_date=date(2023, 5, 31),
                description="Built and maintained multiple client-facing web applications. "
                           "Implemented payment integrations, real-time features with WebSockets, and RESTful APIs.",
                tech_stack=["Python", "Django", "React", "TypeScript", "Redis", "PostgreSQL"],
                is_current=False,
                order=2,
            ),
            Experience(
                id=uuid.uuid4(),
                company="Freelance",
                role="Web Developer",
                start_date=date(2020, 6, 1),
                end_date=date(2021, 12, 31),
                description="Developed custom websites and web applications for various clients. "
                           "Focused on responsive design, performance optimization, and SEO.",
                tech_stack=["JavaScript", "React", "Node.js", "MongoDB", "Tailwind CSS"],
                is_current=False,
                order=3,
            ),
        ]
        for exp in experiences:
            db.add(exp)

        # Projects
        projects = [
            Project(
                id=uuid.uuid4(),
                title="CloudSync Platform",
                description="A real-time file synchronization platform with end-to-end encryption. "
                           "Features include team collaboration, version history, and cross-device sync.",
                tech_stack=["Next.js", "Python", "FastAPI", "PostgreSQL", "Redis", "WebSocket", "AWS S3"],
                github_url="https://github.com/milankhanal/cloudsync",
                live_url="https://cloudsync.demo.com",
                featured=True,
                order=1,
            ),
            Project(
                id=uuid.uuid4(),
                title="AI Content Studio",
                description="An AI-powered content creation tool that helps writers generate, edit, and optimize content. "
                           "Built with OpenAI GPT integration and a beautiful markdown editor.",
                tech_stack=["React", "TypeScript", "Python", "FastAPI", "OpenAI", "TailwindCSS"],
                github_url="https://github.com/milankhanal/ai-studio",
                featured=True,
                order=2,
            ),
            Project(
                id=uuid.uuid4(),
                title="HealthTrack Nepal",
                description="A health monitoring dashboard for Nepali hospitals. Real-time patient data visualization, "
                           "appointment scheduling, and telemedicine integration.",
                tech_stack=["Next.js", "Django", "PostgreSQL", "Chart.js", "Docker"],
                github_url="https://github.com/milankhanal/healthtrack",
                featured=False,
                order=3,
            ),
            Project(
                id=uuid.uuid4(),
                title="E-Commerce Starter Kit",
                description="A production-ready e-commerce boilerplate with payment processing, inventory management, "
                           "and admin dashboard. Built for the Nepali market.",
                tech_stack=["Next.js", "Stripe", "PostgreSQL", "Redis", "TailwindCSS"],
                github_url="https://github.com/milankhanal/ecom-starter",
                featured=False,
                order=4,
            ),
        ]
        for proj in projects:
            db.add(proj)

        # Skills
        skills_data = [
            ("Python", "backend", 5), ("FastAPI", "backend", 5), ("Django", "backend", 4),
            ("Node.js", "backend", 4), ("PostgreSQL", "backend", 5), ("Redis", "backend", 4),
            ("React", "frontend", 5), ("Next.js", "frontend", 5), ("TypeScript", "frontend", 5),
            ("Tailwind CSS", "frontend", 5), ("HTML/CSS", "frontend", 5), ("Framer Motion", "frontend", 4),
            ("Docker", "devops", 4), ("AWS", "devops", 4), ("CI/CD", "devops", 4),
            ("Nginx", "devops", 4), ("Git", "devops", 5), ("Linux", "devops", 4),
            ("Figma", "tools", 3), ("VS Code", "tools", 5), ("Postman", "tools", 4),
        ]
        for i, (name, cat, prof) in enumerate(skills_data):
            db.add(Skill(id=uuid.uuid4(), name=name, category=cat, proficiency=prof, order=i))

        # Blog Posts
        blogs = [
            BlogPost(
                id=uuid.uuid4(),
                title="Building Scalable APIs with FastAPI and SQLAlchemy 2.0",
                slug="building-scalable-apis-fastapi-sqlalchemy",
                body="# Building Scalable APIs with FastAPI and SQLAlchemy 2.0\n\n"
                     "FastAPI has revolutionized Python web development with its modern approach to building APIs. "
                     "In this comprehensive guide, we'll explore how to build production-grade APIs using FastAPI "
                     "combined with SQLAlchemy 2.0's new async capabilities.\n\n"
                     "## Why FastAPI?\n\n"
                     "FastAPI offers several advantages over traditional frameworks:\n\n"
                     "- **Performance**: Built on Starlette and Pydantic, FastAPI delivers incredible performance\n"
                     "- **Type Safety**: Automatic request/response validation via Pydantic\n"
                     "- **Auto Documentation**: Interactive API docs out of the box\n"
                     "- **Async Support**: Native async/await support for high concurrency\n\n"
                     "## Setting Up the Project\n\n"
                     "```python\nfrom fastapi import FastAPI\nfrom sqlalchemy.ext.asyncio import create_async_engine\n\n"
                     "app = FastAPI(title='My API')\n```\n\n"
                     "## Database Layer with SQLAlchemy 2.0\n\n"
                     "SQLAlchemy 2.0 introduced a new declarative mapping style that's cleaner and more intuitive. "
                     "Combined with async support via asyncpg, it's the perfect ORM for FastAPI.\n\n"
                     "## Conclusion\n\n"
                     "FastAPI and SQLAlchemy 2.0 together provide an excellent foundation for building "
                     "modern, scalable web APIs. The type safety, performance, and developer experience "
                     "are unmatched in the Python ecosystem.",
                tags=["Python", "FastAPI", "SQLAlchemy", "API"],
                is_published=True,
                published_at=datetime(2024, 3, 15, tzinfo=timezone.utc),
                views=342,
            ),
            BlogPost(
                id=uuid.uuid4(),
                title="The Art of Component Design in React",
                slug="art-of-component-design-react",
                body="# The Art of Component Design in React\n\n"
                     "Great React applications start with great component design. In this post, I share "
                     "patterns and principles that have helped me build maintainable, reusable components.\n\n"
                     "## Composition Over Inheritance\n\n"
                     "React favors composition over inheritance. Instead of creating deep component hierarchies, "
                     "build small, focused components that can be composed together.\n\n"
                     "## The Single Responsibility Principle\n\n"
                     "Each component should do one thing well. If a component grows too complex, "
                     "break it down into smaller sub-components.\n\n"
                     "## Custom Hooks for Logic Reuse\n\n"
                     "Extract shared logic into custom hooks rather than HOCs or render props.\n\n"
                     "```tsx\nfunction useDebounce<T>(value: T, delay: number): T {\n"
                     "  const [debouncedValue, setDebouncedValue] = useState(value);\n"
                     "  useEffect(() => {\n"
                     "    const timer = setTimeout(() => setDebouncedValue(value), delay);\n"
                     "    return () => clearTimeout(timer);\n"
                     "  }, [value, delay]);\n"
                     "  return debouncedValue;\n}\n```",
                tags=["React", "TypeScript", "Frontend", "Design Patterns"],
                is_published=True,
                published_at=datetime(2024, 2, 20, tzinfo=timezone.utc),
                views=218,
            ),
        ]
        for blog in blogs:
            db.add(blog)

        # Testimonials
        testimonials = [
            Testimonial(
                id=uuid.uuid4(),
                author_name="Rajesh Sharma",
                author_role="CTO",
                company="Tech Innovations",
                text="Milan is an exceptional developer who consistently delivers high-quality code. "
                     "His attention to detail and ability to architect scalable solutions is remarkable.",
                is_featured=True,
                order=1,
            ),
            Testimonial(
                id=uuid.uuid4(),
                author_name="Priya Adhikari",
                author_role="Product Manager",
                company="Digital Nepal Solutions",
                text="Working with Milan was a fantastic experience. He understands both the technical "
                     "and business sides, making him an invaluable team member.",
                is_featured=True,
                order=2,
            ),
        ]
        for t in testimonials:
            db.add(t)

        # Site Settings
        site_settings = SiteSettings(
            id=uuid.uuid4(),
            meta_title="Milan Khanal — Full-Stack Developer",
            meta_description="Portfolio of Milan Khanal — Full-stack developer specializing in Python, React, and cloud technologies.",
            accent_color="#6366f1",
        )
        db.add(site_settings)

        # Birthday Event
        birthday_event = BirthdayEvent(
            id=uuid.uuid4(),
            year=2025,
            birthday_date=date(2025, 5, 15),
            title="Milan's 25th Birthday Bash 🎉",
            message_from_milan="Hey everyone! 🎂\n\nI'm turning 25 this year and I'd love to celebrate with all of you! "
                              "Whether you want to join the cozy room party or hit up a restaurant together, "
                              "I'm excited to have you there.\n\nLet's make it a night to remember! 🎉",
            restaurant_info="📍 The Garden Kitchen, Thamel, Kathmandu\n🕖 7:00 PM onwards\n"
                           "🍽️ Multi-cuisine buffet with live music\n💰 Split bill",
            is_active=True,
        )
        db.add(birthday_event)

        # Menu Items
        menu_items = [
            MenuItem(id=uuid.uuid4(), name="Chicken Momo", category="food", description="Steamed Nepali dumplings with spicy tomato chutney", is_veg=False, order=1),
            MenuItem(id=uuid.uuid4(), name="Veg Spring Rolls", category="food", description="Crispy rolls stuffed with vegetables and glass noodles", is_veg=True, order=2),
            MenuItem(id=uuid.uuid4(), name="Butter Chicken", category="food", description="Creamy tomato-based curry with tender chicken pieces", is_veg=False, order=3),
            MenuItem(id=uuid.uuid4(), name="Paneer Tikka", category="food", description="Grilled cottage cheese marinated in spices", is_veg=True, order=4),
            MenuItem(id=uuid.uuid4(), name="Biryani", category="food", description="Fragrant basmati rice with aromatic spices and herbs", is_veg=False, order=5),
            MenuItem(id=uuid.uuid4(), name="Chocolate Cake", category="food", description="Rich dark chocolate layer cake with ganache", is_veg=True, order=6),
            MenuItem(id=uuid.uuid4(), name="Mango Lassi", category="drink", description="Sweet yogurt drink blended with fresh mango", is_veg=True, order=1),
            MenuItem(id=uuid.uuid4(), name="Masala Chai", category="drink", description="Traditional spiced tea with milk", is_veg=True, order=2),
            MenuItem(id=uuid.uuid4(), name="Fresh Lime Soda", category="drink", description="Refreshing lime juice with soda water", is_veg=True, order=3),
            MenuItem(id=uuid.uuid4(), name="Cold Coffee", category="drink", description="Chilled coffee blended with ice cream", is_veg=True, order=4),
        ]
        for item in menu_items:
            db.add(item)

        await db.commit()
        print("✅ All seed data inserted successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
