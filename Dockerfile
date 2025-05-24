FROM node:20-alpine
WORKDIR /app

# copy lockfiles first and put it into the current working directory which is ./
COPY app/TA-portal-infinity/package*.json ./
RUN npm install

# copy source. All the files in TA-portal-infinity is copied to ./ which is the WORKDIR
COPY app/TA-portal-infinity ./

# bring "test" directory into /app/test in the container
#COPY test/frontend/ ./test/frontend/

# ensure Vite listens on all interfaces. makes npm run dev work inside Docker.
ENV VITE_HOST=0.0.0.0

EXPOSE 5173
CMD ["npm", "run", "dev"]
