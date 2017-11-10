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
  }
};