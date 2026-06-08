import { useParams, useNavigate } from 'react-router-dom';
import { useGetBooksQuery } from '../app/api/apiSlice';

function BookDetail() {
  const { id } = useParams();
  const { data: books, isLoading } = useGetBooksQuery();
  const navigate = useNavigate();

  if (isLoading) return <div className="text-white text-center mt-20">Завантаження...</div>;
  
  const book = books?.find((b) => b.id === parseInt(id));

  if (!book) return <div className="text-white text-center mt-20">Книгу не знайдено</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-20">
      <button onClick={() => navigate('/')} className="mb-8 text-blue-400 hover:underline">← Назад до бібліотеки</button>
      
      <div className="max-w-3xl bg-gray-900 p-10 rounded-3xl border border-gray-800">
        <h1 className="text-5xl font-black mb-6">{book.title}</h1>
        <div className="flex gap-4 mb-8">
          <span className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-bold uppercase">{book.category?.name || "Без жанру"}</span>
        </div>
        
        <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Опис</h3>
        <p className="text-lg leading-relaxed text-gray-300">{book.description || "Опис відсутній."}</p>
        
        <div className="mt-10 pt-10 border-t border-gray-800 text-gray-500 text-sm">
          <p>ID книги: {book.id}</p>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;