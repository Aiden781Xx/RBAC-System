# RBAC Configuration Tool

A full-stack web application for managing Role-Based Access Control (RBAC) configurations. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🎯 What is RBAC? (For Kids)

Imagine you have a toy box with different toys. Some toys are for everyone, some are only for older kids, and some are only for grown-ups. RBAC is like having a special list that says "who can play with what." Just like a teacher decides which students can use the computer lab, RBAC helps decide which people can do which things in an app - like who can edit articles, who can delete users, and who can just look around.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens and password hashing
- **Permission Management**: Full CRUD operations for permissions
- **Role Management**: Full CRUD operations for roles
- **Role-Permission Assignment**: Visual interface to connect permissions to roles
- **Natural Language Configuration**: Configure RBAC using plain English commands (Bonus Feature)
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL/PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **UI**: Shadcn UI + Tailwind CSS
- **Architecture**: MVC & SOLID principles

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rbac-configurator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/rbac_db"
   # Or for PostgreSQL:
   # DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Database Schema

The application uses the following database tables:

- **users**: User accounts with email and hashed passwords
- **permissions**: Individual permissions (e.g., `edit:post`, `delete:user`)
- **roles**: User roles (e.g., `Administrator`, `Editor`)
- **role_permissions**: Junction table linking roles to permissions
- **user_roles**: Junction table linking users to roles

## 🎮 Usage

### 1. Create an Account
- Navigate to `/signup` or click "Sign up" on the login page
- Enter your email and password (minimum 6 characters)

### 2. Create Permissions
- Go to the Dashboard → Permissions
- Click "Create Permission"
- Enter a permission name (e.g., `edit:articles`) and optional description

### 3. Create Roles
- Go to the Dashboard → Roles
- Click "Create Role"
- Enter a role name (e.g., `Content Editor`)

### 4. Assign Permissions to Roles
- In the Roles page, click the key icon next to a role
- Select the permissions you want to assign
- Click "Save Permissions"

### 5. Natural Language Configuration (Bonus)
- Go to Dashboard → Natural Language Configuration
- Type commands in plain English, such as:
  - "Give the role 'Content Editor' the permission to 'edit articles'"
  - "Create a new permission called 'publish content'"
  - "Create a new role called 'Support Agent'"

## 🧪 Test Credentials

After setting up the application, create your own account using the signup page. For testing purposes, you can use:

- **Email**: `admin@example.com`
- **Password**: `password123` (or any password you choose during signup)

## 📁 Project Structure

```
rbac-configurator/
├── app/
│   ├── api/              # API routes (Controllers - HTTP layer only)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── permissions/  # Permission CRUD endpoints
│   │   ├── roles/        # Role CRUD endpoints
│   │   └── natural-language/ # Natural language processing
│   ├── dashboard/        # Dashboard pages (Views)
│   ├── login/           # Login page (View)
│   ├── signup/          # Signup page (View)
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/              # Shadcn UI components
├── lib/
│   ├── services/        # Business logic layer (Services)
│   │   ├── permission.service.ts
│   │   ├── role.service.ts
│   │   ├── user.service.ts
│   │   └── natural-language.service.ts
│   ├── middleware/      # Middleware utilities
│   │   └── auth.middleware.ts
│   ├── auth.ts          # Authentication utilities
│   ├── auth-client.ts   # Client-side auth utilities
│   ├── db.ts            # Prisma client
│   └── utils.ts         # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema (Models)
└── middleware.ts        # Next.js middleware
```

## 🏗️ Architecture

This project follows **MVC (Model-View-Controller)** and **SOLID** principles:

### MVC Architecture:
- **Models**: Prisma schema defines the data models (`prisma/schema.prisma`)
- **Views**: React components in the `app/` directory (UI layer)
- **Controllers**: API routes in `app/api/` handle HTTP requests/responses only
- **Services**: Business logic in `lib/services/` (separated from controllers)
  - `PermissionService`: Handles all permission-related business logic
  - `RoleService`: Handles all role-related business logic
  - `UserService`: Handles authentication and user management
  - `NaturalLanguageService`: Processes natural language commands
- **Middleware**: Authentication middleware protects routes (`lib/middleware/`)

### SOLID Principles:
- **Single Responsibility**: Each service class handles one domain (Permission, Role, User, etc.)
- **Open/Closed**: Services are open for extension but closed for modification
- **Liskov Substitution**: Services can be easily replaced with implementations
- **Interface Segregation**: Services expose only necessary methods
- **Dependency Inversion**: Controllers depend on service abstractions, not concrete implementations

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up a PostgreSQL database (e.g., using Vercel Postgres, Supabase, or Neon)
5. Update `DATABASE_URL` in Vercel environment variables
6. Deploy!

### Database Setup for Production

You can use:
- **MySQL**: Any MySQL-compatible database (e.g., PlanetScale, AWS RDS)
- **PostgreSQL**: Vercel Postgres, Supabase, Neon, Railway
- **PlanetScale**: Serverless MySQL platform
- **AWS RDS**: Managed MySQL/PostgreSQL

After setting up the database, run:
```bash
npx prisma db push
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Login user

### Permissions
- `GET /api/permissions` - List all permissions
- `POST /api/permissions` - Create a permission
- `GET /api/permissions/[id]` - Get a permission
- `PUT /api/permissions/[id]` - Update a permission
- `DELETE /api/permissions/[id]` - Delete a permission

### Roles
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create a role
- `GET /api/roles/[id]` - Get a role
- `PUT /api/roles/[id]` - Update a role
- `DELETE /api/roles/[id]` - Delete a role
- `POST /api/roles/[id]/permissions` - Assign permissions to a role

### Natural Language
- `POST /api/natural-language` - Process natural language commands

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes with middleware
- Input validation with Zod
- SQL injection prevention via Prisma ORM

## 📝 License

This project is created for educational purposes as part of a technical assignment.

## 👤 Author

Built as a full-stack developer intern assignment.

---

**Note**: Make sure to change the `JWT_SECRET` in production and use a strong, unique value!

