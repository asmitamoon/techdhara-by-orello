import { useState } from 'react'
import SubmitArrow from '../../assets/icons/submitArrow.svg'
import { useSubmitContactForm } from '../../hooks/mutations/public'

const INITIAL = { name: '', email: '', contactNumber: '', subject: '', message: '' }

const ContactSection = () => {
  const [form, setForm] = useState(INITIAL)
  const mutation = useSubmitContactForm()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    mutation.mutate(form, { onSuccess: () => setForm(INITIAL) })
  }

  return (
    <section id="contact" className="bg-[#FCF9F1] py-12 sm:py-16 lg:py-26">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">

          <div className="text-center lg:text-left">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl 2xl:text-10xl leading-tight lg:leading-[71px] text-[#6D3C31] mb-3 sm:mb-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg lg:text-xl 2xl:text-2xl leading-relaxed text-primary">
              Have questions? Reach out to our<br className="hidden lg:block" />
              team and we'll get back to you soon.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={set('name')}
                className="w-full px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-[#F0E8DC] border border-[#F4D5CC] rounded-xl text-black placeholder-input-placeholder focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={set('contactNumber')}
                className="w-full px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-[#F0E8DC] border border-[#F4D5CC] rounded-xl text-black placeholder-input-placeholder focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={set('email')}
              className="w-full px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-[#F0E8DC] border border-[#F4D5CC] rounded-xl text-black placeholder-input-placeholder focus:outline-none focus:border-primary transition-colors"
            />

            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={set('subject')}
              className="w-full px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-[#F0E8DC] border border-[#F4D5CC] rounded-xl text-black placeholder-input-placeholder focus:outline-none focus:border-primary transition-colors"
            />

            <textarea
              placeholder="Message"
              rows="6"
              value={form.message}
              onChange={set('message')}
              className="w-full px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-4 bg-[#F0E8DC] border border-[#F4D5CC] rounded-xl text-black placeholder-input-placeholder focus:outline-none resize-none focus:border-primary transition-colors"
            />

            <div className="flex justify-center lg:justify-start">
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="w-full sm:w-auto bg-button-primary text-base sm:text-lg 2xl:text-xl leading-relaxed text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 sm:gap-3 hover:bg-accent-gold transition-colors font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className='py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl bg-[#F4D5CC]'>
                  <img src={SubmitArrow} alt="submit" className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {mutation.isPending ? 'SENDING...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection