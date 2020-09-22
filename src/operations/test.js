const AWS = require('aws-sdk');
const config = require('../config')
const readlineSync = require('readline-sync');

AWS.config.update({
    accessKeyId: config.AWS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ID,
    region: config.AWS_REGION,
})


const ses = new AWS.SES({apiVersion: '2010-12-01'})

console.log("########### Mantenedor de Plantillas ############")
console.log("##                                             ##")
console.log("##   Operación: Realizar Prueba de Plantilla   ##")
console.log("##                                             ##")
console.log("#################################################")


const initTest = async () => {
    try{
        const templatesResponse = await ses.listTemplates().promise();
        const templates = templatesResponse.TemplatesMetadata;
        let selectedTemplate = "";
        let isSelectedTemplate= false;

        while(!isSelectedTemplate){
            console.log("\nElija una de las siguientes plantillas");
            templates.forEach((template, key) => {
                console.log(`${key+1}) ${template.Name}`)
            })
            var selectedOption = readlineSync.questionInt("Opción : \n")
        
            if(selectedOption === "" || selectedOption > templates.length){
                console.log("Opción elegida no existe")
            }else{
                isSelectedTemplate = true;
                
                selectedTemplate = templates[selectedOption-1].Name;
                console.log(selectedTemplate)
            }
        }

        const jsonConf = require(`../templates/${selectedTemplate}.json`);

        if(jsonConf.testData){
            console.log("Realizando Prueba");

            var params = {
                Destination: {
                    ToAddresses: config.TEST_TO_EMAIL_ADDRESSES
                },
                Source: config.TEST_FROM_EMAIL_ADDRESS,
                Template: selectedTemplate,
                TemplateData: JSON.stringify(jsonConf.testData),
                ReplyToAddresses: config.TEST_REPLY_TO_EMAIL,
            }
            await ses.sendTemplatedEmail(params).promise();
        }else{
            console.log(`La plantilla no tiene datos de prueba creados en /templates/${selectedTemplate}.json`)
        }
    }catch(err){
        console.error(err, err.stack);
    }
}

initTest();