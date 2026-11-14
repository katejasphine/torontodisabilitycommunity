DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;

CREATE POLICY "Anyone can send a valid contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(btrim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(btrim(subject)) BETWEEN 1 AND 200
  AND char_length(btrim(message)) BETWEEN 1 AND 4000
);