const fp = require("fastify-plugin");
const { createClient } = require("@supabase/supabase-js");

module.exports = fp(
  async function (fastify, opts) {
    // Check if supabase is already decorated
    if (!fastify.supabase) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );

      fastify.decorate("supabase", supabase);

      fastify.decorate("uploadImage", async function (file) {
        const buffer = await file.toBuffer();
        const filename = `${Date.now()}-${file.filename}`;
        const { data, error } = await supabase.storage
          .from(process.env.BUCKET_NAME)
          .upload(`uploads/${filename}`, buffer, {
            contentType: file.mimetype,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from(process.env.BUCKET_NAME)
          .getPublicUrl(`uploads/${filename}`);

        return urlData.publicUrl;
      });
    }
  },
  {
    name: "supabase-plugin",
    fastify: "4.x",
  }
);
