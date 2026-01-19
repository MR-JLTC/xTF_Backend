export declare class CreateUniversityDto {
    name: string;
    acronym?: string;
    email_domain: string;
    status: 'active' | 'inactive';
    logo_url?: string;
}
export declare class UpdateUniversityDto {
    name?: string;
    acronym?: string;
    email_domain?: string;
    status?: 'active' | 'inactive';
    logo_url?: string;
}
