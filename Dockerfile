# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (lock 파일 있으면 그대로 사용 권장)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm i; \
  fi

COPY . .
RUN npm run build

# ---------- Run stage ----------
FROM nginx:alpine
# SPA 라우팅을 위해 사용자 정의 nginx.conf 사용 (권장)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
