# # Mematikan docker container
# Write-Host "Mematikan docker container"
# docker down -v

# # Menjalankan docker compose dev dan build
# Write-Host "Menjalankan docker compose mode dev dan melakukan build"
# docker compose -f docker-compose.dev.yml up -d --build

# Jalankan perintah ke dalam container MySQL
Write-Host "🧹 Dropping and creating database..."
docker exec -i mysql_container mysql -u root -proot_password -e "DROP DATABASE IF EXISTS amra_db; CREATE DATABASE amra_db;"

# Jalankan migrasi Sequelize
Write-Host "🚀 Running Sequelize migrations..."
docker exec -i Container_server npx sequelize-cli db:migrate

# Jalankan seeder Sequelize
Write-Host "🌱 Seeding database..."
docker exec -i Container_server npx sequelize-cli db:seed:all

Write-Host "Restart Container..."
docker restart Container_server

Write-Host "✅ Done!"

