#include "table.h"

void main(){
	Table table;
	int r, g, b;
	int solution = 0;
	int nLine = 0;

	ifstream fs("table.txt");
	while (!fs.eof())			//test case�� ���� �˱� ���� �޸����� �� �� �о���δ�.
	{
		fs >> r >> g >> b;
		nLine++;
	}
	fs.close();

	cout << " ******************************" << endl;
	cout << "    Algorithm Fifth Homework          201111216_���±�" << endl;
	cout << "      'Table Decorations'" << endl;
	cout << " ******************************" << endl;

	ifstream fcin("table.txt");

	for (int i = 0; i < nLine; i++){
		fcin >> r >> g >> b;
		cout << " ----------------------" << endl;
		cout << "#" << i+1 << " Balloons(red, green, blue) : " << r << ", " << g << ", " << b << endl;
		while (table.feasible(r, g, b)){													//feasible�Լ��� ���� ���̺��� �ٹ� �� �ִٸ� select�Լ��� �����ϰ�,
																							//�׷��� �ʴٸ� while���� �������� �ٹ� ���̺� ���� ����Ѵ�.
			
			table.select(r, g, b);		//select()�Լ��� ���� ���̺� �Ѱ��� �ٹ� �Ŀ� ���� ǳ�� ������ return�޾Ƽ� �������´�.
			solution++;					//while()�� ���ư��� ���� ���̺��� �ٸ��� ���� �̹Ƿ� �ѹ� select�Լ��� ����ǰ� ���������� solution�� 1 ������Ų��.
			
			cout << " " << r << ", " << g << ", " << b << " -> " << solution << "��" << endl; //�����Ȳ�� ���̱� ���� ���̺� �Ѱ��� �ٹ̰� ���� ǳ�� ������ ����Ѵ�.
		}
		cout << " ->A decorated Table : " << solution << "��" << endl << endl; //�ᱹ while()�� ���������� �� �� solution�� ����� ���ڰ� ó�� �Է¹���
		solution = 0;														   //ǳ������ �̿��� �ٹ� ���̺��� �����̴�. �� �� ���� test case�� �����ϱ� ����
	}																		   //solution�� 0���� �ʱ�ȭ ���ش�.
	fcin.close();
}