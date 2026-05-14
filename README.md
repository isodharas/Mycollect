# MyCollect — Web Dashboard
AI-Powered IoT Waste Management System for Homagama Municipal Council, Sri Lanka.

## Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- AWS account with DynamoDB tables configured (ap-southeast-2)

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/isodharas/Mycollect.git
cd Mycollect
git checkout web-dashboard

### 2. Install dependencies
npm install

### 3. Configure environment variables
Create a .env.local file in the root directory:
MYCOLLECT_AWS_ACCESS_KEY_ID=your_aws_access_key
MYCOLLECT_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
NEXTAUTH_SECRET=any_random_string
NEXTAUTH_URL=http://localhost:3000

Note: AWS credentials must use the MYCOLLECT_ prefix. Standard AWS_ prefix is reserved by Next.js and will cause build failures.

### 4. Run the development server
npm run dev

Open http://localhost:3000 in your browser.

## Demo Credentials
- Admin: admin@homagama.lk / admin123
- Demo bins: BIN_001 to BIN_005
- Demo ratepayers: HMC-2024-001 to HMC-2024-005
- Workers: WRK-001 PIN 1234, WRK-002 PIN 5678, WRK-003 PIN 9012

## Tech Stack
- Next.js 14, TypeScript 5, Tailwind CSS
- AWS Lambda, DynamoDB, API Gateway (ap-southeast-2)
- OpenStreetMap + Leaflet.js, NextAuth.js

## Minimum Requirements
- RAM: 4GB
- OS: macOS, Windows, or Linux
- Browser: Chrome, Firefox, or Safari (latest)
