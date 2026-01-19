import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto } from './university.dto';
export declare class UniversitiesController {
    private readonly universitiesService;
    constructor(universitiesService: UniversitiesService);
    create(createUniversityDto: CreateUniversityDto): Promise<import("../database/entities").University>;
    findAll(): Promise<import("../database/entities").University[]>;
    update(id: string, updateUniversityDto: UpdateUniversityDto): Promise<import("../database/entities").University>;
    uploadLogo(id: string, file: any): Promise<{
        success: boolean;
        logo_url: string;
        university: import("../database/entities").University;
    }>;
    remove(id: string): Promise<{
        success: true;
    }>;
}
