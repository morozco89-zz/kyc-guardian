# KYC Guardian

Es una herramienta para la guardia de KYC que permite:

- Cargar los datos de la planilla de cartera asesorada de MLB.
- Realizar pedidos de réplicas de shield.

Cuenta con lógica de reintentos en caso de que falle el cargue de documentos hacia IV o cualquiera de los hardcodes.


## Instalación

Debido a que este proyecto es un Work in Progress se recomienda el siguiente método de instalación.

- Instalar node. Se recomienda el uso de nvm para cambiar con facilidad entre versiones ([guía de instalación](https://blog.jamesauble.com/install-nvm-on-mac-with-brew-adb921fb92cc)).
- Clonar este repo.
- Instalar las dependencias ejecutando el comando `npm i` en el root del proyecto.
- Descargar el archivo [fixtures.js](https://drive.google.com/file/d/1VkwwXgmDesFHBIwK4HDru19AaE159vzb/view?usp=sharing) del drive compartido y dejarlo en el directorio `/src` del proyecto. Aquí se almacenan variables globales del programa como el usuario ldap y token fury por defecto.
- Desde el root del proyecto ejecutar en la terminal:
```bash
npm link
```

## **Cartera asesorada de MLB**

### **Paso 1:**
Descargar todos los documentos del usuario. Estos se encuentran en las celdas:

- I1: Prueba de vida
- J1: Imagen del frente
- K1: Imagen del dorso
- AH1: Documento societario
- AR: Documento de autorizado legal

(Tener en cuenta que en una misma celda pueden haber varios links a archivos).

Por el momento la herramienta solo puede hacer el cargue de un archivo hacia IV, así que cuando existe más de un documento societario o documento de autorizado legal en varios PDFs, se debe hacer el cargue manual mediante el [Admin de KYC](https://billing.adminml.com/userdata/kyc-hardcode) o unificar todos los archivos en un solo PDF utilizando un servicio en línea como [ilovepdf](https://www.ilovepdf.com/merge_pdf).

### **Paso 2:**

Descargar la hoja de Respuestas de la planilla en formato csv

### **Paso 3:**

Ejecutar el comando

```bash
kyc-guardian
```

Seleccionar con las flechas la opción `CA - MLB` y presionar la tecla enter.

```
? What would you like to do? (Use arrow keys)
❯ CA - MLB 
  Shield - Replica
```

Ingresar la ruta del archivo de respuestas en formato csv. Entre paréntesis se muestra el valor por defecto.

```
? Enter csv path (./data.csv)
```

Ingresar el token de fury. Este es requerido para hacer los hardcodes y verificar el estado de compliance.

```
? Enter your fury token (SOME-TOKEN)
```
Ingresar el usuario ldap. Esto es necesario para el parámetro `caller_id` de cada hardcode

```
? Enter your ldap user
```

Ingresar la iniciativa para hacer los hardcodes y comprobar el estado de compliance del usuario (por defecto es ted)

```
? What is the initiative? (ted)
```

Ingresar la razón de los hardcodes, por defecto es `Pedido de CA`

```
? What is the reason? (Pedido de CA)
```

Ingresar el comentario de los hardcodes, por defecto es `Pedido de CA`

```
? What is the comment? (Pedido de CA)
```

Ingresar el usuario principal. Este se encuentra en la casilla C1 (CustID) de la planilla.

```
? Which user to hard code?
```

Ingresar la ruta de cada archivo de IV. Si se desea omitir algún documento se puede escribir `skip` en el path.

```
Complete IV information
? Enter path for proof of life document ./pol.jpeg
? Enter path for document front image ./front.png
? Enter path for document back image ./back.png
? Enter path for partnership deed document ./partnership.pdf
? Enter path for power of attorney document ./awpoa.pdf
```

Esto iniciará el proceso de cargue de documentos. Si el documento fue cargado correctamente se mostrará en `DONE` o `ERROR` de lo contrario.

```
Uploading documentation for user 717324611
	DONE	hardcoded_proof_of_life
	DONE	hardcoded_doc_front
	DONE	hardcoded_doc_back
	DONE	user_company_authorized_with_power_of_attorney
	DONE	user_company_partnership_deed
```

Posteriormente se iniciará el proceso de hardcoding de cada challenge. Aquí se muestra el listado de todos los hardcodes que se hacen.

```
Hardcoding challenges for user 717324611
	DONE	hardcoded_name
	DONE	hardcoded_identifier
	DONE	hardcoded_birthdate
	DONE	hardcoded_phone
	DONE	hardcoded_home_address
	DONE	hardcoded_is_regulated
	DONE	hardcoded_nationality
	DONE	hardcoded_parental_name
	DONE	hardcoded_society_type
	DONE	hardcoded_company_income
	DONE	hardcoded_company_address
	DONE	hardcoded_representative_relationship
	DONE	hardcoded_company_beneficiaries
	DONE	hardcoded_company_shareholders
	DONE	hardcoded_company_representatives
	DONE	hardcoded_company_is_regulated
	DONE	hardcoded_documentation
	DONE	hardcoded_proof_of_life
```
Si falla algún hardcoding se mostrará el cuerpo de la petición para que pueda reintentarse por Postman. Esto ocurre de forma inmediata si hay un Bad Request o si falla la petición después de 5 intentos. Ejemplo:

```
ERROR	hardcoded_name
{"first_name":"LIGIA MARIA","last_name":" FONTANA NUNES","caller_id":"micortes","reason":"Pedido de CA","comment":"Pedido de CA"}
```

Al finalizar el proceso se mostrará el estado de compliance con la iniciativa ingresada. Si el usuario es no compliant y tiene challenge de usuarios pendientes, estos se mostrarán en una lista.
