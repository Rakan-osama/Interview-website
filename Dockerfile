# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS web-builder
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY platform/web/package.json platform/web/package.json
RUN pnpm install --filter @interview-platform/web... --frozen-lockfile
COPY platform/web platform/web
RUN pnpm --dir platform/web build

FROM composer:2 AS php-dependencies
WORKDIR /app
COPY platform/api/composer.json platform/api/composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist
COPY platform/api .
RUN composer dump-autoload --no-dev --no-interaction --no-scripts --classmap-authoritative

FROM php:8.3-fpm-alpine AS runtime
WORKDIR /var/www/html
RUN apk add --no-cache curl icu-libs libzip mariadb-client \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev linux-headers \
    && docker-php-ext-install intl opcache pcntl pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps
COPY --from=php-dependencies /app/vendor vendor
COPY platform/api .
COPY --from=web-builder /workspace/platform/api/public/spa public/spa
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini
RUN chown -R www-data:www-data storage bootstrap/cache \
    && php artisan package:discover --ansi
USER www-data
EXPOSE 9000
STOPSIGNAL SIGTERM
CMD ["php-fpm", "-F"]

FROM nginx:1.29-alpine AS webserver
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=runtime /var/www/html/public /var/www/html/public
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/up || exit 1
