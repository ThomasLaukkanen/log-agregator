import Link from "next/link";

export const Header = () => {
    
    return (
        <header className="border-b  ">
            <nav>
                <ul className="flex  items-center justify-between p-8 ">
                    <li>
                        <Link href="/">Log Agregator</Link>
                    </li>
                    <li>
                        <Link href="/logga in" className="border p-4 rounded">Logga in</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}