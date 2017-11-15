module.exports = {
  webConfig: () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
      <handlers>
           <add name="iisnode" path="server/index.js" verb="*" modules="iisnode"/>
     </handlers>
      <rewrite>
           <rules>
                <rule name="LogFile" patternSyntax="ECMAScript" stopProcessing="true">
                     <match url="iisnode"/>
                </rule>
                <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
                    <match url="^server/index.js\/debug[\/]?" />
                </rule>
                <rule name="NodejsServer">
                     <conditions>
                          <add input="{{REQUEST_FILENAME}}" matchType="IsFile" negate="True"/>
                     </conditions>
                     <action type="Rewrite" url="server/index.js"/>
                </rule>
           </rules>
      </rewrite>
   </system.webServer>
 </configuration>
`;
  },

  dockerfileNodejs: () => {
    return `FROM node:7.7.1
    
WORKDIR /var/nodejs
ENV PORT=8080
EXPOSE 8080

COPY server /var/nodejs/server
COPY package.json /var/nodejs/package.json
COPY appseed.config.js /var/nodejs/appseed.config.js

RUN npm install

CMD ["npm","start"]`;
  },

  dockerfileNginx: () => {
    return `FROM nginx
WORKDIR /
EXPOSE 80
ENV PORT=80

RUN mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/backup

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY www /usr/share/nginx/html/
COPY nginx-forever.sh /nginx-forever.sh

# docker-compose need nginx to NOT run as daemon (b/c it will exit)
CMD ["nginx", "-g", "daemon off;"]`;
  },

  dockerCompose: () => {
    return `version: '2'

services:
  nginx:
    image: appseed-nginx
    container_name: appseed-nginx
    build: ./nginx
    depends_on:
      - "nodejs"
    ports:
      - "80:80"
    # entrypoint: ./wait-for-it.sh web:8080 -- ./nginx-forever.sh
    networks:
      - appseed-network

  nodejs:
    image: appseed-nodejs
    container_name: 'appseed-nodejs'
    build: ./nodejs
    ports:
      - "8080:8080"
    networks:
      - appseed-network

networks:
  appseed-network:
    driver: bridge`;
  },


  dojoProdConfig: () => {
    return `window.dojoConfig = {
  async: true,
  deps: ["app/bundle"],
  packages: [{
    name: "app",
    location: location.origin + '/code',
    main: "bundle"
  }]
};`
  }


};