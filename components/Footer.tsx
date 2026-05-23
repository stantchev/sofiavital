import Link from 'next/link'

import {
    TbWorld,
    TbShare2,
    TbMessageCircle,
    TbLink,
    TbSend,
    TbFeather,
} from 'react-icons/tb'

const links = [
    { title: 'Features', href: '#' },
    { title: 'Solution', href: '#' },
    { title: 'Customers', href: '#' },
    { title: 'Pricing', href: '#' },
    { title: 'Help', href: '#' },
    { title: 'About', href: '#' },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">

                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block w-fit text-lg font-semibold"
                >
                    SofiaVital
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary duration-150"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="my-8 flex flex-wrap justify-center gap-6">
                    <Link href="#" aria-label="Share" className="text-muted-foreground hover:text-primary">
                        <TbShare2 className="size-6" />
                    </Link>

                    <Link href="#" aria-label="Message" className="text-muted-foreground hover:text-primary">
                        <TbMessageCircle className="size-6" />
                    </Link>

                    <Link href="#" aria-label="Link" className="text-muted-foreground hover:text-primary">
                        <TbLink className="size-6" />
                    </Link>

                    <Link href="#" aria-label="Website" className="text-muted-foreground hover:text-primary">
                        <TbWorld className="size-6" />
                    </Link>

                    <Link href="#" aria-label="Send" className="text-muted-foreground hover:text-primary">
                        <TbSend className="size-6" />
                    </Link>

                    <Link href="#" aria-label="Feed" className="text-muted-foreground hover:text-primary">
                        <TbFeather className="size-6" />
                    </Link>
                </div>

                <span className="text-muted-foreground block text-center text-sm">
                    © {new Date().getFullYear()} SofiaVital
                </span>
            </div>
        </footer>
    )
}
