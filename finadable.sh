#!/bin/sh
env="$1"

cp  app-"$env".yaml dist
cp  mod_rewrite.php dist
cp  Mobile_Detect.php dist

cd dist
mv app-"$env".yaml app.yaml

gcloud config set account subhankitc@flexsin.com && gcloud app deploy --project=findable-system --promote && cd ../
