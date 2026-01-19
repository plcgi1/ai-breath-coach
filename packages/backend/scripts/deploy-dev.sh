REMOTE_HOME=/home/alex/www/ether-ai
IP=molochko-vbot
SSH_USER=alex
IP=192.168.1.150
SSH_PORT=22150

yarn run lint:fix
yarn run test
yarn run build

cd ../../

rsync -azv --delete --copy-links --exclude=.git --exclude=.env --exclude=node_modules ./ $SSH_USER@$IP:/$REMOTE_HOME

ssh -p $SSH_PORT -n -f $SSH_USER@$IP "cd $REMOTE_HOME; pwd; yarn install; cd packages/backend; yarn run migrate-up && yarn run test && pm2 restart .ecosystem.config.js --update-env && pm2 save"

exit