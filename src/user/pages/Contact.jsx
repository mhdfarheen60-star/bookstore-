import { useState } from 'react'

const inputClass =
  'w-full rounded border border-gray-300 p-3 outline-none focus:border-blue-900'

function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: send the form to your backend / email service here.
    setSent(true)
    e.currentTarget.reset()
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-14">
      <h1 className="text-center text-3xl font-bold text-black">Contact Us</h1>

      {sent && (
        <p role="status" className="mt-6 rounded bg-green-50 p-3 text-center text-green-700">
          Thanks! Your message has been sent.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" className={inputClass} />
        <input name="email" type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" className={inputClass} />
        <textarea name="message" required rows="5" placeholder="Message" aria-label="Message" className={`${inputClass} resize-none`} />
        <button type="submit" className="w-full rounded bg-blue-900 py-3 font-semibold text-white hover:bg-blue-800">
          Send Message
        </button>
      </form>
    </section>
  )
}

export default Contact
