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

  nodeDockerfile: () => {
    return `FROM node:7.7.1
    
    WORKDIR /var/nodejs
    ENV PORT=8080
    EXPOSE 8080
    
    COPY server /var/nodejs/server
    COPY package.json /var/nodejs/package.json
    COPY config.js /var/nodejs/config.js
    
    RUN npm install
    
    CMD ["npm","start"]`;
  }
};