import moment from 'moment';

const adaptKeys = (data) => ({
    meta: {
        business_unit: data['Unidad de Negocio / Unidade de negócio'],
        ca_representative_email: data['Rep. Correo electrónico / Correio eletrônico'],
        email: data['Dirección de correo electrónico'],
        user_ids: adaptReplicateTo(data['CustID'], data['CustID a Replicar otros Representantes']),
        time_stamp: data['Marca temporal'],
        main_user: data['CustID'],
    },
    challenges: {
        hardcoded_name: {
            first_name: data['Nombre(s) / Nome(s) '],
            last_name: data['Apellido(s) / Sobrenome(s)'],
        },
        hardcoded_identifier: {
            identifier_type: 'CPF',
            identifier_number: adaptIdentifier(data['Número de (CPF)']),
        },
        hardcoded_birthdate: {
            birthdate: adaptBirthDate(data['Fecha de Nacimiento / Data de nascimento']),
        },
        hardcoded_phone: {
            number: data['Rep. Teléfono (Número) '],
            area_code: data['Rep. Teléfono (Código Area) '],
            extension: data['Rep. Teléfono (Extención) '],
            country_code: data['Rep. Teléfono (Código País) '],
        },
        hardcoded_home_address: {
            address_line: data['Rep. Dirección (Calle) / Endereço (Rua)'],
            address_number: data['Rep. Dirección (Número) / Endereço (Número)'],
            city: data['Rep. Dirección (Ciudad) / Endereço (Cidade)'],
            country: data['Rep. Dirección (País) / Endereço (País)'],
            country_code: data['Rep. Dirección (Código ISO País) / Endereço (ISO) País'],
            state_name: data['Rep. Dirección (Estado) / Endereço (Estado)'],
            zip_code: data['Rep. Dirección (Código postal) / Endereço (CEP)'],
        },
        hardcoded_is_regulated: {
            is_pep: adaptIsPep(data['Rep. Regulación PEP']),
        },
        hardcoded_nationality: {
            nationality: adaptNationality(data['Nacionalidad']),
        },
        hardcoded_parental_name: {
            first_name: data['(Madre) Nombre(s) / (Mãe) Nome(s)'],
            last_name: data['(Madre) Apellidos / (Mãe) Sobrenome(s)'],
            relationship: "mother",
        },
        hardcoded_society_type: {
            society_type: adaptSocietyType(data['Tipo de sociedad / Tipo de sociedade']),
        },
        hardcoded_company_income: {
            income: adaptCompanyIncome(data['¿Cual es la facturación mensual /Qual é o faturamento por mês da sociedade?']),
            frequency: 'monthly',
        },
        hardcoded_company_address: {
            address_line: data['Emp. Dirección (Calle) / Endereço (Rua) '],
            address_number: data['Emp.  Dirección (Número) / Endereço (Número)'],
            additional_info: data['Emp. Dirección (Complemento) / Endereço (Complemento)'],
            city: data['Emp. Dirección (Estado) / Endereço (Estado)'],
            country: data['Emp. Dirección (País) / Endereço (País)'],
            country_code: data['Emp. Dirección (Código ISO País) / Endereço (ISO) País'],
            state_name: data['Emp. Dirección (Estado) / Endereço (Estado)'],
            zip_code: data['Emp. Dirección (Código postal) / Endereço (CEP)'],
        },
        hardcoded_representative_relationship: {
            relationship: adaptRepresentativeRelationship(data['Rep. Cargo / Posição']),
        },
        hardcoded_company_beneficiaries: {
            data: adaptBeneficiariesArray([
                data['Beneficiario / Beneficiários (1)'],
                data['Beneficiario / Beneficiários (2)'],
                data['Beneficiario / Beneficiários (3)'],
                data['Beneficiario / Beneficiários (4)'],
                data['Beneficiario / Beneficiários (5)'],
            ]),
        },
        hardcoded_company_shareholders: {
            data: adaptShareholdersArray([
                data['Accionista / Acionista (1)'],
                data['Accionista / Acionista (2)'],
                data['Accionista / Acionista (3)'],
                data['Accionista / Acionista (4)'],
            ]),
        },
        hardcoded_company_representatives: {
            data: adaptShareholdersArray([
                data['Representante (1)'],
                data['Representante (2)'],
            ]),
        },
        hardcoded_company_is_regulated: adaptCompanyIsRegulated(data['Emp. Regulaciones / Regulamentos']),
        // hardcoded_corporate_name: data['Nombre de la Empresa / Nome da companhia',
        // Número de CNPJ / Numero do CNPJ
        // Facturación anual de la sociedad por ventas de mercadería o servicios
        // Categoría del negocio / Categoria do negócio
    },
});

const adaptReplicateTo = (mainUser, replicates) => {

    let separator = ';';
    if (replicates.includes(',')) {
        separator = ',';
    }

    let arrayReplicates = (replicates || '').split(separator).map(r => r.trim());

    if (arrayReplicates.length === 0 || arrayReplicates.length === 1 && arrayReplicates[0] === '') {
        return [mainUser];
    }

    return [mainUser, ...arrayReplicates]
};
const adaptDashValue = (raw) => {
    const values = raw.split(' - ');
    if (values.length > 0) {
        return values[0].trim();
    }
    return '';
};
const adaptSocietyType = adaptDashValue;
const adaptCompanyIncome = adaptDashValue;
const adaptRepresentativeRelationship = adaptDashValue;
const adaptNationality = adaptDashValue;
const adaptBeneficiariesArray = (persons) => {
    return persons.flatMap(person => {
        let separator = ';';
        if (person.includes(',')) {
            separator = ',';
        }

        const data = person.replace(/['"]+/g, '').split(separator);
        if (data.length === 2) {
            return [{
                first_name: (data[1] || '').trim(),
                identification_number: (data[0] || '').trim(),
                identification_type: 'CPF',
            }];
        }
        if (data.length === 3) {
            return [{
                first_name: (data[1] || '').trim(),
                last_name: (data[2] || '').trim(),
                identification_type: 'CPF',
                identification_number: (data[0] || '').trim(),
            }];
        }
        if (data.length === 4) {
            return [{
                first_name: (data[1] || '').trim(),
                last_name: (data[2] || '').trim(),
                identification_type: 'CPF',
                identification_number: (data[0] || '').trim(),
                share: (data[3] || '').replace(/\D/g,''),
            }];
        }
        return [];
    }).filter(p => p.first_name !== '' && p.last_name !== '' && p.identification_number !== '');
};
const adaptShareholdersArray = (persons) => {
    return persons.map(person => {
        let separator = ';';
        if (person.includes(',')) {
            separator = ',';
        }

        const data = person.replace(/['"]+/g, '').split(separator);

        if (data.length === 5) {
            return {
                first_name: (data[1] || '').trim(),
                last_name: (data[2] || '').trim(),
                identification_type: 'CPF',
                identification_number: (data[0] || '').trim(),
                nationality: (data[3] || '').trim(),
                share: parseInt((data[4] || '').replace(/\D/g,'')),
            };
        } else if (data.length === 3) {
            return {
                first_name: (data[1] || '').trim(),
                last_name: (data[2] || '').trim(),
                identification_type: 'CPF',
                identification_number: (data[0] || '').trim(),
                share: 100,
            };
        }

        return {
            first_name: (data[1] || '').trim(),
            last_name: (data[2] || '').trim(),
            identification_type: 'CPF',
            identification_number: (data[0] || '').trim(),
            share: parseInt((data[3] || '').replace(/\D/g,'')),
        };

    }).filter(p => p.first_name !== '' && p.last_name !== '' && p.identification_number !== '' && p.share);
};
const adaptIsPep = (isPepText) => {
    return isPepText === 'Si';
};
const adaptBirthDate = (dateRaw) => {
    return moment(dateRaw, 'DD/MM/YYYY').toISOString();
};
const adaptCompanyIsRegulated = (companyRegulations) => {
    const regulations = {
        is_fatca: null,
        is_regulated_entity: null,
    };

    if (companyRegulations === 'FACTA') {
        regulations.is_fatca = true;
    }

    return regulations;
};
const adaptIdentifier = (identifierNumberRaw) => {
    return identifierNumberRaw.replace(/\D/g,'');
};

export const adapt = ({data = []}) => {
    return {data: data.map(adaptKeys)};
};
