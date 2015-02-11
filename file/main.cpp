#include "table.h"

void main(){
	Table table;
	int r, g, b;
	int solution = 0;
	int nLine = 0;

	ifstream fs("table.txt");
	while (!fs.eof())			//test case의 수를 알기 위해 메모장을 한 번 읽어들인다.
	{
		fs >> r >> g >> b;
		nLine++;
	}
	fs.close();

	cout << " ******************************" << endl;
	cout << "    Algorithm Fifth Homework          201111216_김태균" << endl;
	cout << "      'Table Decorations'" << endl;
	cout << " ******************************" << endl;

	ifstream fcin("table.txt");

	for (int i = 0; i < nLine; i++){
		fcin >> r >> g >> b;
		cout << " ----------------------" << endl;
		cout << "#" << i+1 << " Balloons(red, green, blue) : " << r << ", " << g << ", " << b << endl;
		while (table.feasible(r, g, b)){													//feasible함수를 통해 테이블을 꾸밀 수 있다면 select함수를 실행하고,
																							//그렇지 않다면 while문을 빠져나와 꾸민 테이블 수를 출력한다.
			
			table.select(r, g, b);		//select()함수를 통해 테이블 한개를 꾸민 후에 남은 풍선 개수를 return받아서 빠져나온다.
			solution++;					//while()이 돌아가는 수가 테이블이 꾸며진 갯수 이므로 한번 select함수가 실행되고 빠져나오면 solution을 1 증가시킨다.
			
			cout << " " << r << ", " << g << ", " << b << " -> " << solution << "개" << endl; //진행상황을 보이기 위해 테이블 한개를 꾸미고 남은 풍선 갯수를 출력한다.
		}
		cout << " ->A decorated Table : " << solution << "개" << endl << endl; //결국 while()을 빠져나오고 그 때 solution에 저장된 숫자가 처음 입력받은
		solution = 0;														   //풍선들을 이용해 꾸민 테이블의 개수이다. 그 후 다음 test case를 실행하기 위해
	}																		   //solution을 0으로 초기화 해준다.
	fcin.close();
}