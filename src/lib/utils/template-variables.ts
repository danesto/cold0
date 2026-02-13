import type { Contact } from '../../generated/client';

/**
 * Contact fields that can be used as template variables
 */
export type TemplateVariableKey = Pick<
	Contact,
	| 'email'
	| 'firstName'
	| 'lastName'
	| 'company'
	| 'jobTitle'
	| 'website'
	| 'phone'
	| 'linkedInUrl'
	| 'industry'
	| 'companySize'
	| 'numberOfEmployees'
	| 'city'
	| 'country'
>;

/**
 * List of supported template variable keys
 */
export const TEMPLATE_VARIABLES: (keyof TemplateVariableKey)[] = [
	'email',
	'firstName',
	'lastName',
	'company',
	'jobTitle',
	'website',
	'phone',
	'linkedInUrl',
	'industry',
	'companySize',
	'numberOfEmployees',
	'city',
	'country'
];

/**
 * Replace template variables in a string with contact data
 * Supports variables in the format: {{variableName}}
 *
 * @param template - The template string with variables like {{firstName}}, {{company}}, etc.
 * @param contact - The contact data to use for replacement
 * @returns The template string with variables replaced by contact data
 *
 * @example
 * const subject = "Hello {{firstName}} from {{company}}";
 * const result = replaceTemplateVariables(subject, contact);
 * // Result: "Hello John from Acme Corp"
 */
export function replaceTemplateVariables(
	template: string,
	contact: Partial<TemplateVariableKey>
): string {
	let result = template;

	for (const variable of TEMPLATE_VARIABLES) {
		const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
		const value = contact[variable];
		// Convert to string, handling null/undefined and numbers
		const replacement = value != null ? String(value) : '';
		result = result.replace(regex, replacement);
	}

	return result;
}
