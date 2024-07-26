const fp = require("fastify-plugin");
const { createClient } = require("@supabase/supabase-js");

module.exports = fp(async function (fastify, opts) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  fastify.decorate("supabase", supabase);

  fastify.decorate("uploadImage", async function (file) {
    const buffer = await file.toBuffer();
    const filename = `${Date.now()}-${file.filename}`;
    const { data, error } = await supabase.storage
      .from("your-bucket-name")
      .upload(`uploads/${filename}`, buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("your-bucket-name")
      .getPublicUrl(`uploads/${filename}`);

    return urlData.publicUrl;
  });
});
