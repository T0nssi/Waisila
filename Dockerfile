FROM nginx:alpine
COPY dist/client /usr/share/nginx/html
EXPOSE 80
