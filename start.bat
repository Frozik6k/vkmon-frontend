git add .
git commit -m "update"
git push
docker build -t my-spa:latest .
docker run --rm -p 4173:80 my-spa:latest