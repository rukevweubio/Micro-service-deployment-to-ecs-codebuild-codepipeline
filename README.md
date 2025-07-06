# Project Overview

This project demonstrates a fully automated CI/CD pipeline for deploying a microservice using GitLab CI/CD, Docker Hub, and Google Kubernetes Engine (GKE). The pipeline covers the entire lifecycle from code commit to deployment, ensuring fast, reliable, and repeatable releases with minimal manual intervention.

## Problem Statement

Deploying microservices manually involves several repetitive and error-prone steps, such as building Docker images, pushing them to a registry, and updating deployments in Kubernetes. This manual process can lead to:

- Inconsistent builds and deployments.
- Increased risk of human error.
- Slow release cycles.
- Difficulty in tracking and rolling back changes.

The project aims to solve these issues by introducing automation at every stage of the deployment process.

## Solution Approach
The solution leverages the following technologies and practices:
1. **Source Code Management:** All application code, Dockerfiles, and Kubernetes manifests are stored in a GitLab repository for version control and collaboration.
2. **Continuous Integration (CI):** GitLab CI/CD is used to automatically build and test the microservice on every commit or merge to the main branch.
3. **Dockerization:** The application is containerized using Docker, ensuring consistency across development, testing, and production environments.
4. **Image Registry:** Built Docker images are pushed to Docker Hub, serving as a central repository for deployment artifacts.
5. **Continuous Deployment (CD):** The pipeline deploys the latest Docker image to GKE using Kubernetes manifests, ensuring the application is always up-to-date.

## Step-by-Step Workflow

### 1. Clone the Repository

Start by cloning the project repository from GitLab:

```bash
git clonehttps://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline
cd Micro-service-deployment-to-ecs-codebuild-codepipeline
```

### 2. Build and Test Locally

Before pushing changes, you can build and run the Docker image locally to verify functionality:

```bash
docker build -t rukevweubio/nodejs-app-design:latest .
docker run -p 8080:8080 rukevweubio/nodejs-app-design:latest
```

### 3. Configure GitLab CI/CD

- **Docker Hub Credentials:**  
    Add `DOCKERHUB_USERNAME` and `DOCKERHUB_PASSWORD` as CI/CD variables in your GitLab project settings.
- **Google Cloud Credentials:**  
    - Create a service account in GCP with permissions for GKE and Kubernetes Engine Developer.
    - Download the service account key as JSON, encode it in base64, and add it as `GCLOUD_SERVICE_KEY` in GitLab CI/CD variables.
    - Add `GCP_PROJECT_ID`, `GKE_CLUSTER`, and `GKE_ZONE` as additional variables.

### 4. Update Pipeline and Kubernetes Files

- Edit `.gitlab-ci.yml` to use your Docker Hub username, image name, and GKE details.
- Update `k8s/deployment.yaml` with your deployment name, namespace, and image details.

### 5. Push Code to Trigger Pipeline

Commit and push your changes to the main branch:

```bash
git add .
git commit -m "Set up CI/CD pipeline for microservice deployment"
git push origin main
```

This triggers the GitLab pipeline, which will:

- Build the Docker image.
- Push the image to Docker Hub.
- Deploy the image to GKE using `kubectl`.

## Key Code and Configuration

### `.gitlab-ci.yml` (Pipeline Definition)

```yaml
stages:
    - build
    - push
    - deploy

variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

build:
    stage: build
    image: docker:latest
    services:
        - docker:dind
    script:
        - docker build -t $IMAGE_TAG .
    only:
        - main

push:
    stage: push
    image: docker:latest
    services:
        - docker:dind
    script:
        - echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
        - docker tag $IMAGE_TAG rukevweubio/nodejs-app-design:$CI_COMMIT_SHORT_SHA
        - docker push rukevweubio/nodejs-app-design:$CI_COMMIT_SHORT_SHA
    only:
        - main

deploy:
    stage: deploy
    image: google/cloud-sdk:alpine
    script:
        - echo $GCLOUD_SERVICE_KEY | base64 -d > ${HOME}/gcloud-service-key.json
        - gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
        - gcloud config set project $GCP_PROJECT_ID
        - gcloud container clusters get-credentials $GKE_CLUSTER --zone $GKE_ZONE
        - kubectl set image deployment/nodejs-app =rukevweubio/nodejs-app-designe:$CI_COMMIT_SHORT_SHA -n dev
    only:
        - main
```
![gitlab workflow](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1290).png)
![gitlab workflow](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1292).png)


**Explanation:**
- **build:** Builds the Docker image using the latest commit SHA as the tag.
- **push:** Authenticates to Docker Hub and pushes the image.
- **deploy:** Authenticates to GCP, fetches GKE credentials, and updates the Kubernetes deployment with the new image.

### `Dockerfile` (Sample)

```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```
![docker image](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1293).png)
**Explanation:**  
Defines a lightweight Node.js environment, installs dependencies, copies source code, exposes port 8080, and starts the application.

![ gks cluster](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1308).png)

### `k8s/deployment.yaml` (Sample)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: your-deployment
    namespace: dev
spec:
    replicas: 2
    selector:
        matchLabels:
            app: nodeja-app
    template:
        metadata:
            labels:
                app: nodejs-app
        spec:
            containers:
                - name: nodejs-app-design
                    image: rukevweubio/nodejs-app-design:latest
                    ports:
                        - containerPort: 8080
```

**Explanation:**  
Defines a Kubernetes deployment with two replicas, specifying the Docker image and exposed port.
![ kubernates cluster](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1300).png)

### nodejs app
![nodejs-app-deploymnet](https://github.com/rukevweubio/Micro-service-deployment-to-ecs-codebuild-codepipeline/blob/main/screenshoot/Screenshot%20(1310).png)

## Additional Recommendations

- **Security:** Use GitLab CI/CD masked variables for all secrets.
- **Monitoring:** Integrate logging and monitoring tools (e.g., Stackdriver, Prometheus) for production deployments.
- **Rollback:** Consider implementing automated rollback strategies in case of deployment failures.

## Summary

By following this workflow, you establish a robust, automated CI/CD pipeline that builds, tests, and deploys your microservice to GKE using GitLab and Docker Hub. This approach minimizes manual intervention, reduces errors, and accelerates your release cycles, making your deployments more reliable and scalable.


