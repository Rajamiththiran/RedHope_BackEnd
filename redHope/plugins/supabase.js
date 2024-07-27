const fp = require("fastify-plugin");
const { createClient } = require("@supabase/supabase-js");

module.exports = fp(
  async function (fastify, opts) {
    console.log("Initializing Supabase plugin");

    if (!fastify.supabase) {
      console.log("Creating Supabase client");
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );

      fastify.decorate("supabase", supabase);

      fastify.decorate("uploadImage", async function (file) {
        console.log("Starting image upload to Supabase");
        try {
          const buffer = await file.toBuffer();
          console.log("File buffered successfully");

          const filename = `${Date.now()}-${file.filename}`;
          console.log("Uploading file:", filename);

          const { data, error } = await supabase.storage
            .from(process.env.BUCKET_NAME)
            .upload(`uploads/${filename}`, buffer, {
              contentType: file.mimetype,
            });

          if (error) {
            console.error("Error uploading to Supabase:", error);
            throw error;
          }

          console.log("Upload successful, getting public URL");
          const { data: urlData, error: urlError } = supabase.storage
            .from(process.env.BUCKET_NAME)
            .getPublicUrl(`uploads/${filename}`);

          if (urlError) {
            console.error("Error getting public URL:", urlError);
            throw urlError;
          }

          console.log("Public URL obtained:", urlData.publicUrl);
          return urlData.publicUrl;
        } catch (error) {
          console.error("Error in uploadImage:", error);
          throw error;
        }
      });
    } else {
      console.log("Supabase client already initialized");
    }
  },
  {
    name: "supabase-plugin",
    fastify: "4.x",
  }
);
