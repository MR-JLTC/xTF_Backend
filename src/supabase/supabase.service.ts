import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private logger = new Logger(SupabaseService.name);
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");

    // Prioritize service_role key for server-side operations (bypasses RLS).
    // The anon key is only safe for client-side use WITH RLS enabled.
    const serviceRoleKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
    const anonKey = this.configService.get<string>("SUPABASE_KEY");
    const supabaseKey = serviceRoleKey || anonKey;

    if (anonKey && !serviceRoleKey) {
      this.logger.warn(
        "⚠️ Using SUPABASE_KEY (anon key) instead of SUPABASE_SERVICE_ROLE_KEY. " +
          "Server-side operations may fail if RLS is enabled. " +
          "Set SUPABASE_SERVICE_ROLE_KEY in your environment variables.",
      );
    }

    this.bucketName =
      this.configService.get<string>("SUPABASE_BUCKET") ||
      "tutorfriends-uploads";

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error(
        "Supabase credentials not found in environment variables " +
          "(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY)",
      );
      // Not throwing error to allow app to start, but uploads will fail
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(
    folder: string,
    filename: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const path = `${folder}/${filename}`;

    // Upsert to true allows overwriting, which matches some previous logic (e.g., profile images)
    // but for tutor docs we generally want unique names which the controller handles via numbering
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Failed to upload file to ${path}: ${error.message}`);
      throw error;
    }

    const { data: publicData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return publicData.publicUrl;
  }

  async listFiles(folder: string, searchPrefix?: string): Promise<string[]> {
    // List files in the folder to help with sequence numbering
    // Supabase list accepts a path (folder) and options
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(folder, {
        limit: 100,
        search: searchPrefix,
      });

    if (error) {
      this.logger.error(`Failed to list files in ${folder}: ${error.message}`);
      return [];
    }

    return data.map((f) => f.name);
  }

  getPublicUrl(folder: string, filename: string): string {
    const path = `${folder}/${filename}`;
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
