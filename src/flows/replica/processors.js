import chalk from 'chalk';
import objectPath from 'object-path';
import { hardCodeChallenge, isCompliant } from './services';

export const log = (data) => {
    console.log(data);
    return data;
};

/**
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ],
 *      develop: {Object},
 * }
 * @param {Object} context Builds necessary hardcoded requests based on develop Object
 */
export const buildHardcodes = (context) => {
    context.hardcodes = {
        ...buildPoL(context),
        ...buildDocumentation(context),
        ...buildIdentifier(context),
        ...buildBirthDate(context),
        ...buildPhone(context),
        ...buildHomeAddress(context),
        ...buildCompanyAddress(context),
        ...buildName(context),
        ...buildIsRegulated(context),
        ...buildLegallyAuthorized(context),
        ...buildCompanyIsRegulated(context),
        ...buildNationality(context),
        ...buildOccupation(context),
        ...buildRepresentativeRelationship(context),
        ...buildCompanyBeneficiaries(context),
    };
    return context;
};

/**
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ],
 *      develop: {Object},
 *      hardcodes: {Object},
 * }
 * @param {Object} context Builds necessary hardcoded requests based on develop Object
 */
export const buildUserChallenges = (context) => {
    context.userChallenges = {
        ...buildUserCompanyRegulated(context),
    };
    return context;
};

const buildUserCompanyRegulated = (context) => ({
    user_company_regulated: {
        is_fatca: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_company_regulated.is_fatca', null),
	    is_regulated_entity: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_company_regulated.is_regulated_entity', null),
    }
});

const buildPoL = (context) => {
    let url = objectPath.get(context, 'develop.raw_execution_result.MapChunks.documentation_image.iv.proof_of_life_resources_urls.0', '');
    if (url === '') {
        url = objectPath.get(context, 'develop.raw_execution_result.MapChunks.documentation_image.hardcoded_proof_of_life.proof_of_life_resources_urls.0', '');
    }

    return {
        hardcoded_proof_of_life: {
            selfie_url: url,
            comment: context.comment,
            reason: context.reason,
            caller_id: context.ldap,
        }
    };
};

const buildDocumentation = (context) => ({
    hardcoded_documentation: {
        doc_front_url: objectPath.get(context, 'develop.raw_execution_result.MapChunks.documentation_image.doc_front_url', ''),
        doc_back_url: objectPath.get(context, 'develop.raw_execution_result.MapChunks.documentation_image.doc_back_url', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildIdentifier = (context) => {
    const siteID = objectPath.get(context, 'develop.raw_execution_result.SiteID', '').toLowerCase();
    const identifierType = objectPath.get(context, `develop.raw_execution_result.MapChunks.${siteID}_identifier_legal_representative.identifier.type`, '');
    const identifierNumber = objectPath.get(context, `develop.raw_execution_result.MapChunks.${siteID}_identifier_legal_representative.identifier.number`, '');

    return {
        hardcoded_identifier: {
            identifier_type: identifierType,
            identifier_number: identifierNumber,
            comment: context.comment,
            reason: context.reason,
            caller_id: context.ldap,
        }
    };
};

const buildBirthDate = (context) => {
    const birthDate = objectPath.get(context, 'develop.raw_execution_result.MapChunks.birthdate.birthdate', '');

    return {
        hardcoded_birthdate: {
            birthdate: birthDate + 'T00:00:00.000Z',
            comment: context.comment,
            reason: context.reason,
            caller_id: context.ldap,
        }
    };
};

const buildPhone = (context) => ({
    hardcoded_phone: {
        area_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.phone_person.phone_area_code', ''),
        country_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.phone_person.phone_country_code', ''),
        extension: objectPath.get(context, 'develop.raw_execution_result.MapChunks.phone_person.phone_extension', ''),
        number: objectPath.get(context, 'develop.raw_execution_result.MapChunks.phone_person.phone_number', ''),
        verified: false,
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildHomeAddress = (context) => ({
    hardcoded_home_address: {
        state_name: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.state_name', ''),
        zip_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.zip_code', ''),
        city: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.city', ''),
        country: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.country', ''),
        address_line: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.address_line', ''),
        address_number: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.address_number', ''),
        state_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.state_code', ''),
        country_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.home_address.address.country_code', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildCompanyAddress = (context) => ({
    hardcoded_company_address: {
        state_name: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.state_name', ''),
        zip_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.zip_code', ''),
        city: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.city', ''),
        country: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.country', ''),
        address_line: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.address_line', ''),
        address_number: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.address_number', ''),
        // state_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.state_code', ''),
        // country_code: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_address.address.country_code', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildName = (context) => ({
    hardcoded_name: {
        first_name: objectPath.get(context, 'develop.raw_execution_result.MapChunks.name.first_name', ''),
        last_name: objectPath.get(context, 'develop.raw_execution_result.MapChunks.name.last_name', ''),
        second_last_name: objectPath.get(context, 'develop.raw_execution_result.MapChunks.name.second_last_name', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildIsRegulated = (context) => ({
    hardcoded_is_regulated: {
        is_pep: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_person_regulated.is_pep', null),
        is_fatca: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_person_regulated.is_fatca', null),
        is_regulated_entity: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_person_regulated.is_regulated_entity', null),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildLegallyAuthorized = (context) => ({
    hardcoded_legally_authorized: {
        legally_authorized: true,
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildCompanyIsRegulated = (context) => ({
    hardcoded_company_is_regulated: {
        is_fatca: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_company_regulated.is_fatca', null),
	    is_regulated_entity: objectPath.get(context, 'develop.raw_execution_result.MapChunks.is_company_regulated.is_regulated_entity', null),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildNationality = (context) => ({
    hardcoded_nationality: {
        nationality: objectPath.get(context, 'develop.raw_execution_result.MapChunks.nationality.nationality', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildOccupation = (context) => ({
    hardcoded_occupation: {
        occupation: objectPath.get(context, 'develop.raw_execution_result.MapChunks.occupation.occupation', ''),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

const buildRepresentativeRelationship = (context) => {
    let relationship = objectPath.get(context, 'develop.raw_execution_result.MapChunks.legally_authorized.representative_relationship', '');
    if (relationship === '') {
        relationship = objectPath.get(context, 'develop.raw_execution_result.MapChunks.representative_relationship.representative_relationship', '');
    }

    return {
        hardcoded_representative_relationship: {
            relationship: relationship,
            comment: context.comment,
            reason: context.reason,
            caller_id: context.ldap,
        }
    };
};

const buildCompanyBeneficiaries = (context) => ({
    hardcoded_company_beneficiaries: {
        data: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_beneficiaries.beneficiaries', null),
        beneficiaries_declared: objectPath.get(context, 'develop.raw_execution_result.MapChunks.company_beneficiaries.beneficiaries_declared', null),
        comment: context.comment,
        reason: context.reason,
        caller_id: context.ldap,
    }
});

/**
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ],
 *      develop: {Object},
 *      hardcodes: {Object},
 *      userChallenges: {Object}
 * }
 * @param {Object} context Execute list of hardcodes for all user_ids
 */
export const processReplicas = async (context) => {
    for (const userID of context.user_ids) {
        console.log(chalk.bold(`\nHardcoding challenges for user ${userID}\n`));
        for (const hardCodeName in context.hardcodes) {
            try {
                await hardCodeChallenge(context, userID, hardCodeName, context.hardcodes[hardCodeName]);
            } catch (e) {
                console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
                console.log(JSON.stringify(context.hardcodes[hardCodeName]));
            }
        }
    }
    return context;
};

export const validateCompliance = async (context) => {
    for (const userID of context.user_ids) {
        try {
            await isCompliant(context, userID);
        } catch (e) {
            console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
        }
    }
    return context;
};
