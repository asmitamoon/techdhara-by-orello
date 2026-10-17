import { Link } from 'react-router';

const ProblemStatementSection = ({ items = [] }) => {
  return (
    <div className="mb-8">
      <div className="bg-white p-4 border border-accent-green-light rounded-3xl">
        <h3 className="text-2xl font-normal mb-4">
          Problem Statements
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {items.map((problem, index) => (
            <Link
              key={index}
              to={`/admin/problems/${problem.type}/${problem.id}`}
              className="rounded-xl p-2 border border-accent-green-light transition-all hover:bg-accent-green/5 block"
            >
              <div className="text-sm text-accent-green-dark line-clamp-2 mb-1 underline">
                  {problem.title}
              </div>
              <div className="text-sm font-medium line-clamp-1">
               {problem.author}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemStatementSection;