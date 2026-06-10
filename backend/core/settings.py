from pathlib import Path
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-vd8medz7(vzy6e-_ruc7!p3+wfru%vtg638wg^cl$3t9pd-31j'

# Виправлено: DEBUG має бути True для розробки
DEBUG = True

# Виправлено: Дозволено всі хости, щоб уникнути помилок запуску
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'corsheaders',  # Додано для вирішення CORS
    
    'rest_framework',
    'rest_framework_simplejwt',  
    'users',
    'library',
    'drf_spectacular',  # Додано інтеграцію Swagger документації
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Має бути першим
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'library',
        'USER': 'admin',
        'PASSWORD': 'adminpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'uk'
TIME_ZONE = 'Europe/Kyiv'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('uk', _('Ukrainian')),
    ('en', _('English')),
]

STATIC_URL = 'static/'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # Підключено автоматичну генерацію схем API
}

# --- НАЛАШТУВАННЯ CORS ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# --- НАЛАШТУВАННЯ SWAGGER ДОКУМЕНТАЦІЇ ---
SPECTACULAR_SETTINGS = {
    'TITLE': 'Цифрова Бібліотека API',
    'DESCRIPTION': 'Інтеракція та повна документація ендпоінтів системи керування бібліотекою (ТЗ Частина 3)',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# --- НАЛАШТУВАННЯ ПОШТИ (MAILHOG ДЛЯ ЛОКАЛЬНОГО ТЕСТУВАННЯ) ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'localhost'
EMAIL_PORT = 1025  
EMAIL_USE_TLS = False
EMAIL_USE_SSL = False
DEFAULT_FROM_EMAIL = 'admin@digitallibrary.com'