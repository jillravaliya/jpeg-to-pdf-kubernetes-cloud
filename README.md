# JPEG to PDF Converter – From Localhost to the Real Internet

[![Deployed](https://img.shields.io/badge/Status-Live-success?style=flat-square)](https://jpeg-to-pdf-frontend.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Online-blue?logo=react&logoColor=white)](https://jpeg-to-pdf-frontend.onrender.com)
[![Backend](https://img.shields.io/badge/Backend-Online-green?logo=node.js&logoColor=white)](https://jpeg-to-pdf-backend-iujr.onrender.com)
[![Kubernetes](https://img.shields.io/badge/K8s-Ready-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)

-----

## I thought Docker Compose was the end.

I could run everything with **one command**.

**But it only worked on MY laptop.**

What if I wanted to:

- **Share it with the world?**
- **Scale to 1000 users?**
- **Automatically recover from crashes?**

That’s when I discovered **Kubernetes**—and took my app from **‘localhost’ to the real internet.**

-----

## Live Application

🌐 **Frontend:** <https://jpeg-to-pdf-frontend.onrender.com>  
⚙️ **Backend:** <https://jpeg-to-pdf-backend-iujr.onrender.com>

**Try it yourself.** Upload images. Get a PDF. It’s running on real servers, accessible from anywhere in the world.

-----

## The Problem with Docker Compose

After [Project 2](https://github.com/jillravaliya/jpeg-to-pdf-docker-compose), I had a perfect setup.

```bash
docker-compose up
```

**One command. Everything worked.**

But then reality hit:

- **Only works on my laptop** – No one else can access it
- **No scaling** – Can’t handle multiple users
- **No auto-recovery** – If a container crashes, it stays dead
- **No load balancing** – One backend, one point of failure
- **No monitoring** – I have no idea what’s happening in production

I realized something important:

> **A system that only runs on localhost isn’t production-ready — it’s a science experiment.**

I needed to understand:

- How to deploy to the cloud
- How to scale automatically
- How to handle real traffic
- How Kubernetes orchestrates containers

That’s what led to this project.

-----

## What I Built

### **Same App, Real Infrastructure**

The core functionality stayed the same:

- Upload JPEG images
- Merge into a single PDF
- Download instantly

**But now:**

- Deployed on **Render.com** (accessible worldwide)
- **Kubernetes manifests** ready for any cluster
- Separate frontend and backend deployments
- Health checks and auto-restart
- Environment-based configuration
- Production-grade Nginx serving

-----

## Architecture Evolution

### **Before (Docker Compose):**

```
Local Machine
├── docker-compose.yml
├── Frontend Container (localhost:80)
└── Backend Container (localhost:3000)
```

**Problem:** No one can access it except me.

-----

### **After (Cloud Deployment):**

```
Internet
    ↓
[Render.com Load Balancer]
    ↓
Frontend Service (Nginx) → https://jpeg-to-pdf-frontend.onrender.com
    ↓
Backend Service (Node.js) → https://jpeg-to-pdf-backend-iujr.onrender.com
```

**Now:** Anyone, anywhere can use it.

-----

## The Journey – Step by Step

### Step 1: Understanding Kubernetes

Before jumping into deployment, I needed to understand **what Kubernetes actually does**.

Docker Compose orchestrates containers on **one machine**.  
Kubernetes orchestrates containers across **many machines**.

Key concepts I learned:

- **Pods** – Groups of containers that work together
- **Deployments** – How many replicas to run
- **Services** – Network access to pods
- **Ingress** – Routing external traffic

**The “aha” moment:**  
Kubernetes doesn’t run containers. It **declares desired state** and makes it happen.

```yaml
replicas: 2  # I want 2 copies running
```

Kubernetes says: *“Got it. I’ll make sure 2 are always running. If one crashes, I’ll start another.”*

-----

### Step 2: Writing Kubernetes Manifests

I started translating my `docker-compose.yml` into Kubernetes YAML files.

#### **Backend Deployment** (`k8s/backend-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jpeg-to-pdf-backend
spec:
  replicas: 2  # Run 2 instances for reliability
  template:
    spec:
      containers:
      - name: backend
        image: YOUR_REGISTRY/jpeg-to-pdf-backend:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
```

**Key learning:** Health checks are critical. Kubernetes needs to know if a pod is alive.

-----

#### **Backend Service** (`k8s/backend-service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: jpeg-to-pdf-backend
spec:
  type: ClusterIP  # Internal only
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: jpeg-to-pdf-backend
```

**This creates internal DNS:** Other pods can reach the backend at `http://jpeg-to-pdf-backend:3000`.

-----

#### **Frontend Deployment** (`k8s/frontend-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jpeg-to-pdf-frontend
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: frontend
        image: YOUR_REGISTRY/jpeg-to-pdf-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: API_URL
          value: "http://jpeg-to-pdf-backend:3000"
```

**Notice:** The frontend knows where the backend is through **service names**, not IP addresses.

-----

#### **Ingress** (`k8s/ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jpeg-to-pdf-ingress
spec:
  rules:
  - host: your-domain.onrender.com
    http:
      paths:
      - path: /
        backend:
          service:
            name: jpeg-to-pdf-frontend
      - path: /api
        backend:
          service:
            name: jpeg-to-pdf-backend
```

**This routes external traffic** to the right services.

-----

### Step 3: The Kubernetes Curiosity

At this point, I had all the manifests ready.

I could deploy to **any Kubernetes cluster:**

```bash
kubectl apply -f k8s/
```

**But here’s what I realized:**

Setting up a Kubernetes cluster is… **complex.**

- Need a cluster (Minikube? GKE? EKS?)
- Need to configure `kubectl`
- Need to manage nodes
- Need to set up ingress controllers
- Need to handle SSL certificates

For my first real deployment, I wanted something **simpler**.

That’s when I discovered **Render.com**.

-----

### Step 4: Deploying to Render

Render is like Heroku but **better and cheaper**.

Key features:

- Auto-deploys from Git
- Free SSL certificates
- Built-in load balancing
- Environment variable management
- Health checks and auto-restart

#### **Creating `render.yaml`**

```yaml
services:
  # Backend
  - type: web
    name: jpeg-to-pdf-backend
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
    
  # Frontend
  - type: web
    name: jpeg-to-pdf-frontend
    runtime: docker
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: API_URL
        value: ${BACKEND_URL}  # Automatically set by Render
```

**One file. Two services. Automatically deployed.**

-----

### Step 5: The First Deployment

I pushed my code to GitHub, connected Render, and…

**It failed.**

```
Error: Cannot find module '@vitejs/plugin-react'
```

**The problem:** My frontend Dockerfile wasn’t installing dev dependencies needed for the build.

**The fix:**

```dockerfile
# Install ALL dependencies (including dev) for build
RUN npm install

# Build the app
RUN npm run build
```

**Second attempt… it failed again.**

```
Error: API_URL is undefined
```

**The problem:** The frontend couldn’t find the backend URL.

**The fix:** I created `init-config.sh` to inject runtime configuration:

```bash
#!/bin/sh
cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
  API_URL: '${API_URL:-/api}'
};
EOF
exec nginx -g 'daemon off;'
```

**Third attempt…**

**Both services deployed successfully!**

-----

### Step 6: Testing in Production

I opened the frontend URL:

```
https://jpeg-to-pdf-frontend.onrender.com
```

**The page loaded!** 🎉

I uploaded some test images…

**The download prompt appeared.**

**`converted.pdf` saved to my computer.**

That moment — seeing my app work from a completely different machine, accessed through a real URL — was pure magic.

-----

## Problems I Faced (and Solved)

Every deployment teaches you something. Here’s what broke:

|Problem                              |Solution                                                               |
|-------------------------------------|-----------------------------------------------------------------------|
|**Frontend can’t reach backend**     |Used `window.__APP_CONFIG__` for runtime configuration                 |
|**Build fails with missing deps**    |Changed `npm install --only=production` to `npm install` in build stage|
|**CORS errors**                      |Added proper CORS headers in backend (`cors` middleware)               |
|**Environment variables not loading**|Created `init-config.sh` to inject config at container startup         |
|**Health checks failing**            |Added `/health` endpoint to both services                              |
|**Nginx config issues**              |Used custom `nginx.conf` with proper routing                           |
|**Port conflicts**                   |Frontend on 80, backend on 3000, both exposed correctly                |
|**SSL not working**                  |Let Render handle it (automatic with their load balancer)              |

**Key takeaway:** Production is different from development. Always test in real conditions.

-----

## What I Learned

### **1. Kubernetes is About Abstraction**

Docker: *“Run this container with these settings.”*  
Kubernetes: *“I want 2 replicas. You figure out how.”*

This abstraction is **powerful** because:

- Kubernetes handles failures automatically
- You declare intent, not implementation
- Scaling is just changing a number

### **2. Health Checks Are Critical**

Without health checks:

- Kubernetes doesn’t know if your app is working
- Dead containers stay dead
- Users hit broken instances

With health checks:

- Kubernetes restarts failed pods
- Load balancers route around failures
- Systems self-heal

### **3. Configuration vs Code**

I learned to separate:

- **Build-time config** (baked into the image)
- **Runtime config** (injected at startup)

This is why `init-config.sh` exists. The same Docker image works in:

- Local development
- Staging
- Production

Just change the environment variables.

### **4. Cloud Platforms Simplify K8s**

Setting up a raw Kubernetes cluster is **hard**.

Platforms like Render, Heroku, and Vercel abstract away:

- Cluster management
- Load balancing
- SSL certificates
- Monitoring
- Logging

For small projects, this is **perfect**.

For large projects, you eventually need raw Kubernetes.

### **5. The Internet is Just Computers Talking**

My app works because:

- **DNS** translates domain names to IPs
- **Load balancers** distribute traffic
- **Docker containers** run my code
- **Nginx** serves static files
- **Node.js** processes requests

Understanding this stack makes everything less magical.

-----

## Tech Stack Summary

### **Backend**

- **Runtime:** Node.js 18 (Alpine)
- **Framework:** Express.js 4.18.2
- **File Handling:** Multer 1.4.5
- **Image Processing:** Sharp 0.32.0
- **PDF Generation:** PDFKit 0.13.0

### **Frontend**

- **UI Library:** React 18.2.0
- **Build Tool:** Vite 4.4.0
- **Web Server:** Nginx (Production)

### **DevOps & Deployment**

- **Containerization:** Docker
- **Orchestration:** Kubernetes (manifests ready)
- **Cloud Platform:** Render.com
- **CI/CD:** Git-based auto-deploy
- **SSL:** Automatic (via Render)

-----

## How to Run This Project

### **Option 1: Access the Live App**

Just visit:

- 🌐 **Frontend:** <https://jpeg-to-pdf-frontend.onrender.com>
- ⚙️ **Backend:** <https://jpeg-to-pdf-backend-iujr.onrender.com>

**No setup needed.** It’s already running.

-----

### **Option 2: Run Locally with Docker Compose**

```bash
# Clone the repository
git clone https://github.com/jillravaliya/jpeg-to-pdf-k8s-deployment.git
cd jpeg-to-pdf-k8s-deployment

# Start everything
docker-compose up

# Access locally
# Frontend: http://localhost
# Backend: http://localhost:3000
```

-----

### **Option 3: Deploy to Kubernetes**

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# Access via LoadBalancer or Ingress
kubectl get ingress
```

**Note:** You’ll need to:

1. Push images to a container registry (Docker Hub, GCR, ECR)
1. Update image URLs in deployment files
1. Configure ingress with your domain

-----

### **Option 4: Deploy to Render**

1. Fork this repository
1. Connect to Render.com
1. Create two Web Services:
- **Backend:** Point to `backend/Dockerfile`
- **Frontend:** Point to `frontend/Dockerfile`
1. Set environment variables:
- Frontend: `API_URL` = your backend URL
1. Deploy!

**Render will automatically:**

- Build your Docker images
- Deploy to their infrastructure
- Give you public URLs
- Handle SSL certificates
- Monitor health checks

-----

## The Moment It Clicked

I was debugging environment variables for hours.

The frontend kept saying: *“Backend not found.”*

I checked:

- ✅ Backend was running
- ✅ Frontend was running
- ✅ Both had public URLs

Then I realized:

> The frontend runs **in the browser**, not on the server.

When React tries to call `http://jpeg-to-pdf-backend:3000`, it’s running on **your computer**, not Render’s servers.

**The frontend needs the public URL, not the internal service name.**

That’s why I use `window.__APP_CONFIG__` — it injects the correct URL at runtime.

This wasn’t a bug. This was me learning **where code actually executes**.

-----

## What’s Next

Right now, my app is **live and working**.

But this is just the beginning.

### **Next Steps (Kubernetes Mastery):**

**1. Deploy to a Real K8s Cluster**

- Set up GKE/EKS/AKS
- Configure `kubectl`
- Apply my manifests
- Test scaling and failover

**2. Add Monitoring**

- Prometheus for metrics
- Grafana for dashboards
- See real-time traffic

**3. Set Up CI/CD**

- GitHub Actions
- Automatic builds on push
- Deploy to staging first
- Blue-green deployments

**4. Add a Database**

- MongoDB or PostgreSQL
- Persistent volumes
- Backup strategies

**5. Implement Auto-Scaling**

- Horizontal Pod Autoscaler
- Scale based on CPU/memory
- Handle traffic spikes

**6. SSL and Custom Domains**

- cert-manager for certificates
- Real domain with DNS

-----

## Why This Matters

### **For Me**

I learned:

- How real systems are deployed
- How Kubernetes orchestrates workloads
- How cloud platforms work
- How to think in **distributed systems**

This isn’t just a project. It’s a **mental model** for how the internet works.

### **For Anyone Using This**

You get:

- A real working app (accessible from anywhere)
- Kubernetes manifests (ready for any cluster)
- A deployment guide (Render, K8s, Docker)
- Production patterns (health checks, env config, auto-restart)

No more “works on my machine.”

This is **real infrastructure**.

-----

## Connect With Me

I’m actively learning, building, and seeking opportunities in **network engineering** and **cloud infrastructure**.

- Email: **jillahir9999@gmail.com**
- LinkedIn: [linkedin.com/in/jill-ravaliya-684a98264](https://linkedin.com/in/jill-ravaliya-684a98264)
- GitHub: [github.com/jillravaliya](https://github.com/jillravaliya)

**Open to:**

- Entry-to-mid-level network engineering roles
- Cloud infrastructure opportunities
- DevOps and Kubernetes positions
- Mentorship & collaboration
- Professional networking

-----

### ⭐ If this project helped you understand Kubernetes and cloud deployment, give it a star!
