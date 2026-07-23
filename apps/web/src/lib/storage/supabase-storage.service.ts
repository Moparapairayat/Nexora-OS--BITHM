/**
 * Nexora OS — Supabase Storage Architecture Service
 */

export interface StorageUploadResult {
  success: boolean;
  path: string;
  publicUrl?: string;
  error?: string;
}

export class SupabaseStorageService {
  private static getSupabaseConfig() {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    return { supabaseUrl, serviceKey };
  }

  /**
   * Generates a public URL for a file stored in a Supabase storage bucket.
   */
  public static getPublicUrl(bucket: string, filePath: string): string {
    const { supabaseUrl } = this.getSupabaseConfig();
    if (!supabaseUrl) return "";
    const cleanUrl = supabaseUrl.replace(/\/$/, "");
    const cleanPath = filePath.replace(/^\//, "");
    return `${cleanUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  /**
   * Uploads a file buffer or blob to Supabase Storage via REST API.
   */
  public static async uploadFile(
    bucket: string,
    filePath: string,
    fileData: Buffer | Uint8Array,
    contentType: string = "application/octet-stream"
  ): Promise<StorageUploadResult> {
    const { supabaseUrl, serviceKey } = this.getSupabaseConfig();

    if (!supabaseUrl || !serviceKey) {
      return {
        success: false,
        path: filePath,
        error: "Supabase storage is not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).",
      };
    }

    try {
      const cleanUrl = supabaseUrl.replace(/\/$/, "");
      const cleanPath = filePath.replace(/^\//, "");
      const endpoint = `${cleanUrl}/storage/v1/object/${bucket}/${cleanPath}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: fileData as unknown as BodyInit,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Supabase Storage Upload HTTP ${res.status}: ${errBody}`);
      }

      const publicUrl = this.getPublicUrl(bucket, cleanPath);
      return {
        success: true,
        path: cleanPath,
        publicUrl,
      };
    } catch (err: any) {
      console.error("[SupabaseStorageService] Upload failed:", err.message);
      return {
        success: false,
        path: filePath,
        error: err.message,
      };
    }
  }

  /**
   * Deletes a file from Supabase Storage.
   */
  public static async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    const { supabaseUrl, serviceKey } = this.getSupabaseConfig();
    if (!supabaseUrl || !serviceKey) return false;

    try {
      const cleanUrl = supabaseUrl.replace(/\/$/, "");
      const cleanPath = filePath.replace(/^\//, "");
      const endpoint = `${cleanUrl}/storage/v1/object/${bucket}/${cleanPath}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      });

      return res.ok;
    } catch (err: any) {
      console.error("[SupabaseStorageService] Delete failed:", err.message);
      return false;
    }
  }
}
