# Hotel Reservation System

## Requirements
- Java 17+
- Node.js 16+
- PostgreSQL

## Setup

### Database
Create a PostgreSQL database named `hotel_db`.
Create a user `postgre_user` with password `!postgre1234@`.

### Backend
Navigate to `backend` directory.
Run using your IDE or Gradle:
```bash
./gradlew bootRun
```
(Note: You may need to generate gradle wrapper first if not present: `gradle wrapper`)

### Frontend
Navigate to `frontend` directory.
Install dependencies:
```bash
npm install
```
Run development server:
```bash
npm run dev
```

## Features
- Login/Register (JWT)
- Role-based access (User, Owner, Admin)
- Hotel & Room Management
- Room Search & Reservation
- Late Checkout Support

## 배포 (Deployment)

### 운영 환경 배포 방법

#### Backend (Spring Boot)
1. 프로젝트 루트(`c:\dev\HotelWeb\backend`)에서 빌드 명령어를 실행합니다:
   ```bash
   ./gradlew build -x test
   ```
2. 빌드가 완료되면 `build/libs` 폴더에 JAR 파일이 생성됩니다.
3. 생성된 JAR 파일을 실행하여 서버를 구동합니다:
   ```bash
   java -jar build/libs/hotel-reservation-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```
   (운영 환경 설정 파일 `application-prod.yml`이 필요할 수 있습니다.)

#### Frontend (React + Vite)
1. `frontend` 디렉토리로 이동합니다.
2. 빌드 명령어를 실행합니다:
   ```bash
   npm run build
   ```
3. `dist` 폴더에 정적 파일들이 생성됩니다.
4. Nginx, Apache 등의 웹 서버를 사용하여 `dist` 폴더의 내용을 호스팅합니다.
   예시 (serve 패키지 사용):
   ```bash
   npm install -g serve
   serve -s dist
   ```

