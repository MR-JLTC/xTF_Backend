import { Repository } from 'typeorm';
import { University } from '../database/entities';
import { CreateUniversityDto, UpdateUniversityDto } from './university.dto';
export declare class UniversitiesService {
    private universitiesRepository;
    constructor(universitiesRepository: Repository<University>);
    create(createUniversityDto: CreateUniversityDto): Promise<University>;
    findAll(): Promise<University[]>;
    update(id: number, updateUniversityDto: UpdateUniversityDto): Promise<University>;
    remove(id: number): Promise<{
        success: true;
    }>;
}
