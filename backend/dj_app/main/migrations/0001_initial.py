# Generated by Django 3.1.7 on 2021-03-13 09:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('login', models.CharField(max_length=80, unique=True, verbose_name='Name')),
                ('is_online', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='UserConnection',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sid', models.CharField(max_length=250, unique=True, verbose_name='SID')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.userprofile')),
            ],
        ),
    ]
