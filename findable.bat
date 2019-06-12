SET env=%1

copy app-%env%.yaml dist
copy mod_rewrite.php dist
copy Mobile_Detect.php dist

cd dist
rename app-%env%.yaml app.yaml

gcloud config set account findable.cc@gmail.com && gcloud app deploy --project=findable-system --promote && cd ../
