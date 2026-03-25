from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0004_projectacquisition"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="status",
            field=models.CharField(
                choices=[("ongoing", "Ongoing"), ("completed", "Completed"), ("research", "Research")],
                db_index=True,
                default="ongoing",
                max_length=20,
            ),
        ),
    ]
