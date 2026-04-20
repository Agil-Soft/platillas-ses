const fs = require('fs');
const AWS = require('aws-sdk');
const readlineSync = require('readline-sync');
const config = require('../config')

  
AWS.config.update({
    region: config.AWS_REGION,
})

const ses = new AWS.SES({apiVersion: '2010-12-01'})

console.log("########### Mantenedor de Plantillas ############")
console.log("##                                             ##")
console.log("##   Operación: Subir o Actualizar Plantilla   ##")
console.log("##                                             ##")
console.log("#################################################")

const filesSearch = fs.readdirSync("./src/templates");
const files = filesSearch.filter((file) => file.split('.')[1] === "html");

const isAllMode = process.argv.includes("--all");

const createOrUpdateTemplate = async (params) => {
    let searchTemplate = null;
    try{
        searchTemplate = await ses.getTemplate({TemplateName: params.Template.TemplateName}).promise();
    }catch(err){
        console.log("No existe")
    }

    try{
        if(searchTemplate){
            await ses.updateTemplate(params).promise();
            console.log(`Plantilla ${params.Template.TemplateName} Actualizada Correctamente`)
        }else{
            await ses.createTemplate(params).promise();
            console.log(`Plantilla ${params.Template.TemplateName} Creada Correctamente`)
        }
        
    }catch(err){
        console.error(err, err.stack);
    }
}

const buildTemplateParams = (fileName) => {
    const file = fs.readFileSync(`./src/templates/${fileName}`);
    const templateName = fileName.replace(" ", "").split(".")[0];
    const jsonConf = require(`../templates/${templateName}.json`);

    return {
        Template : {
            TemplateName : templateName,
            SubjectPart: jsonConf.subject,
            HtmlPart: file.toString(),
        }
    };
};

const selectTemplateFile = () => {
    let selectedFile = "";
    let isSelectedFile = false;

    while(!isSelectedFile){
        console.log("\nElija una de las siguientes plantillas");
        files.forEach((file, key) => {
            console.log(`${key+1}) ${file}`)
        })
        const selectedOption = readlineSync.questionInt("Opción : \n")

        if(selectedOption === "" || selectedOption > files.length){
            console.log("Opción elegida no existe")
        }else{
            isSelectedFile = true;
            selectedFile = files[selectedOption-1];
        }
    }

    return selectedFile;
};

const syncAllTemplates = async () => {
    console.log(`Modo --all: sincronizando ${files.length} plantillas`);

    for (const fileName of files) {
        const templateName = fileName.replace(" ", "").split(".")[0];
        console.log(`\nConfigurando Plantilla ${templateName}`);
        const params = buildTemplateParams(fileName);
        await createOrUpdateTemplate(params);
    }

    console.log("\nSincronización masiva finalizada");
};

const main = async () => {
    if (isAllMode) {
        await syncAllTemplates();
        return;
    }

    const selectedFile = selectTemplateFile();
    const templateName = selectedFile.replace(" ", "").split(".")[0];
    console.log(`Configurando Plantilla ${templateName}`);
    const params = buildTemplateParams(selectedFile);
    await createOrUpdateTemplate(params);
};

main();

